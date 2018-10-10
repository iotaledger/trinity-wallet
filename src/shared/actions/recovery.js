import map from 'lodash/map';
import reduce from 'lodash/reduce';
import some from 'lodash/some';
import { selectedAccountStateFactory, getRemotePoWFromState } from '../selectors/accounts';
import { syncAccount, syncAccountAfterSpending } from '../libs/iota/accounts';
import { cleanUpAccountState, updateAccountInfoAfterSpending, syncAccountBeforeSweeping } from './accounts';
import { sweep } from '../libs/iota/recovery';
import { formatIota } from '../libs/iota/utils';
import { byteToChar, bytesToTrits } from '../libs/iota/converter';
import { getLatestAddress } from '../libs/iota/addresses';
import { DEFAULT_SECURITY } from '../config';
import { setByteTritSweepInfo, setCompletedByteTritSweep } from './settings';
import i18next from '../i18next';
import { getBalancesAsync } from '../libs/iota/extendedApi';
import { generateAlert } from './alerts';
import Errors from '../libs/errors';

/**
 * Do byte-trit check
 * @param {object} accounts - Account information {accountName, seed}
 * @param {function} genFn - Address generation function
 */
export const byteTritCheck = (accounts, genFn) => async (dispatch, getState) => {
    const state = getState();

    const affectedAccounts = [];

    for (let i = 0; i < accounts.length; i++) {
        const accountInfo = state.accounts.accountInfo[accounts[i].accountName];

        const addressCount = Math.max(accountInfo.addresses ? Object.keys(accountInfo.addresses).length + 20 : 30, 30);

        const seedTrits = bytesToTrits(accounts[i].seedTrits.filter((trit) => trit > -1).slice(0, 81));
        const addresses = await genFn(seedTrits, 0, 2, addressCount);

        const balances = await getBalancesAsync()(typeof addresses === 'string' ? [addresses] : addresses);
        const balanceTotal = balances.balances.reduce((total, balance) => parseInt(total) + parseInt(balance));

        if (balanceTotal > 0) {
            const inputs = balances.balances
                .map((balance, keyIndex) => ({
                    address: addresses[keyIndex],
                    keyIndex,
                    balance: parseInt(balance),
                    security: DEFAULT_SECURITY,
                }))
                .filter((addressData) => addressData.balance > 0);

            affectedAccounts.push(Object.assign({}, accounts[i], { inputs }));
        }
    }

    if (affectedAccounts.length) {
        dispatch(setByteTritSweepInfo(affectedAccounts));
    } else {
        dispatch(setCompletedByteTritSweep(true));
    }
};

/**
 * Do byte-trit sweep
 * @param {function} genFn - Address generation function
 * @param {function} powFn - Proof-of-Work function
 * @param {function} dialogFn - Confirmation dialog functions
 */
export const byteTritSweep = (genFn, powFn, dialogFn) => (dispatch, getState) => {
    const accounts = getState().settings.byteTritInfo;

    const sweeps = accounts.map(async (account) => {
        await dispatch(cleanUpAccountState(account.seedTrits, account.accountName, genFn));

        let result = await dispatch(
            recover(account.accountName, account.seedTrits, account.inputs, powFn, genFn, dialogFn),
        );

        while (result.failedInputs.length) {
            dispatch(
                generateAlert(
                    'error',
                    i18next.t('bytetrit:sweepError'),
                    i18next.t('bytetrit:sweepErrorExplanation'),
                    10000,
                ),
            );
            result = await dispatch(
                recover(account.accountName, account.seedTrits, result.failedInputs, powFn, genFn, dialogFn),
            );
        }
    });

    Promise.all(sweeps).then(() => {
        dispatch(setByteTritSweepInfo(null));
        dispatch(setCompletedByteTritSweep(true));

        dispatch(
            generateAlert(
                'success',
                i18next.t('bytetrit:sweepSucceeded'),
                i18next.t('bytetrit:sweepSucceededExplanation'),
                10000,
            ),
        );
    });
};

/**
 * Recover funds.
 *
 * @param  {string} accountName
 * @param  {array} seedTrits
 * @param  {object} inputs Inputs list [{ address, keyIndex, balance, security }]
 * @param  {function} powFn
 * @param  {function} genFn
 * @param  {function} dialogFn
 *
 * @returns {function} dispatch
 */
export const recover = (accountName, seedTrits, inputs, powFn, genFn, dialogFn) => (dispatch, getState) => {
    const seedFromBytes = map(seedTrits, (byte) => byteToChar(byte)).join('');

    if (some(inputs, (input) => input.balance === 0)) {
        return Promise.reject(new Error(Errors.DETECTED_INPUT_WITH_ZERO_BALANCE));
    }

    return reduce(
        inputs,
        (promise, input) => {
            return promise.then((result) => {
                // Sync account state in each iteration
                return syncAccount()(selectedAccountStateFactory(accountName)(getState()), seedTrits, genFn)
                    .then((newState) => {
                        dispatch(syncAccountBeforeSweeping(newState));

                        const receiveAddress = getLatestAddress(newState.addresses);

                        return (
                            dialogFn(
                                i18next.t('bytetrit:sweepConfirmation', {
                                    amount: formatIota(input.balance),
                                    address: receiveAddress,
                                    index: input.keyIndex,
                                    accountName,
                                }),
                                i18next.t('continue'),
                                i18next.t('bytetrit:sweepConfirmationTitle'),
                            )
                                // Wait for user confirmation
                                .then(() =>
                                    sweep(
                                        null,
                                        // If remote proof of work is enabled in settings
                                        // Pass in null for PoWFn
                                        getRemotePoWFromState(getState()) ? null : powFn,
                                    )(seedFromBytes.slice(0, 81), input, {
                                        address: receiveAddress,
                                        value: input.balance,
                                    }),
                                )
                        );
                    })
                    .then(({ transactionObjects }) =>
                        syncAccountAfterSpending()(
                            seedTrits,
                            accountName,
                            transactionObjects,
                            // Since we updated state before sweeping
                            // Get the latest state directly via store.getState()
                            selectedAccountStateFactory(accountName)(getState()),
                            // We are sure that it is a value transaction
                            true,
                            genFn,
                        ),
                    )
                    .then(({ newState }) => {
                        dispatch(updateAccountInfoAfterSpending(newState));
                        result.sweptInputs.push(input);

                        return result;
                    })
                    .catch(() => {
                        result.failedInputs.push(input);
                        // We should keep track of the failed sweeps and retry
                        return result;
                    });
            });
        },
        Promise.resolve({ sweptInputs: [], failedInputs: [] }),
    );
};
