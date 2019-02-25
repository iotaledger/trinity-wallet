import assign from 'lodash/assign';
import get from 'lodash/get';
import filter from 'lodash/filter';
import find from 'lodash/find';
import flatMap from 'lodash/flatMap';
import includes from 'lodash/includes';
import isUndefined from 'lodash/isUndefined';
import keys from 'lodash/keys';
import map from 'lodash/map';
import pick from 'lodash/pick';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import { syncAccount } from '../libs/iota/accounts';
import { fetchRemoteNodes } from '../libs/iota/utils';
import { Account, Node, Wallet } from '../storage';

/**
 * Migrates nodes (custom & remote) to Realm storage
 *
 * @method migrateNodes
 * @param {array} nodes
 *
 * @returns {Promise}
 */
export const migrateNodes = (nodes) => {
    return fetchRemoteNodes().then((remoteNodes) => {
        if (size(remoteNodes)) {
            Node.addNodes(
                map(nodes, (node) => {
                    const remoteNode = find(remoteNodes, { node: node.url });

                    if (remoteNode) {
                        return assign({}, node, { pow: remoteNode.pow });
                    }

                    return assign({}, node, { pow: false });
                }),
            );
        }

        // If there is an error fetching remote nodes
        // Then assign each node pow disbaled
        Node.addNodes(map(nodes, (node) => assign({}, node, { pow: false })));
    });
};

/**
 * Migrates wallet settings to Realm storage
 *
 * @method migrateSettings
 * @param {object} settings
 *
 * @returns {Promise}
 */
export const migrateSettings = (settings) => {
    const { onboardingComplete, errorLog, customNodes, nodes } = settings;

    // Migrate nodes including custom nodes added by user.
    return migrateNodes([
        ...map(
            // Filter custom nodes
            filter(nodes, (node) => !includes(customNodes, node)),
            (node) => ({ url: node, custom: false }),
        ),
        ...map(customNodes, (node) => ({ url: node, custom: true })),
    ]).then(() => {
        // Merge old settings and update storage.
        Wallet.updateLatest({
            onboardingComplete,
            errorLog,
            settings: pick(settings, [
                'locale',
                'mode',
                'language',
                'currency',
                'availableCurrencies',
                'conversionRate',
                'themeName',
                'hasRandomizedNode',
                'remotePoW',
                'autoPromotion',
                'lockScreenTimeout',
                'autoNodeSwitching',
                'is2FAEnabled',
                'isFingerprintEnabled',
                'acceptedTerms',
                'acceptedPrivacy',
                'hideEmptyTransactions',
                'isTrayEnabled',
                'completedByteTritSweep',
                'notifications',
                'completedForcedPasswordUpdate',
                'node',
            ]),
        });
    });
};

/**
 * Migrates account and related info to Realm storage
 *
 * @method migrateAccounts
 * @param {object} accounts
 *
 * @returns {Promise}
 */
export const migrateAccounts = (accounts) => {
    const { accountInfo, failedBundleHashes, setupInfo, tasks } = accounts;
    const accountNames = keys(accountInfo);

    const manuallyAssignAccountIndex = (accountIndex, fallbackIndex) =>
        !isUndefined(accountIndex) ? accountIndex : fallbackIndex;

    return reduce(
        accountNames,
        (promise, accountName, idx) => {
            return promise.then(() => {
                const thisAccountInfo = accountInfo[accountName];
                const { addresses } = thisAccountInfo;

                // In old storage, addresses is an object but has been changed to array in the updated Account schema.
                const addressData = map(addresses, (data, address) => assign({}, data, { address }));
                const index = get(thisAccountInfo, 'index');

                return syncAccount()({
                    addressData,
                    // Transactions structure has been changed in the updated Account schema model. See schema/index.js.
                    // Previously, transactions were normalised before they were added to storage
                    // The transaction structure has been updated now and it follows (https://domschiener.gitbooks.io/iota-guide/content/chapter1/transactions-and-bundles.html)
                    // It's impossible to reverse engineer updated transactions structure from normalised transactions, so we sync transactions from scratch.
                    // NOTE: A user will lose transactions that were pruned in the most recent snapshot. However, failed transactions will be kept.
                    transactions: [],
                }).then((accountData) => {
                    Account.createIfNotExists(
                        accountName,
                        assign({}, accountData, {
                            meta: get(thisAccountInfo, 'meta'),
                            index: !isUndefined(index)
                                ? index
                                : manuallyAssignAccountIndex(get(thisAccountInfo, 'accountIndex'), idx),
                            usedExistingSeed: get(setupInfo, `${accountName}.usedExistingSeed`) || false,
                            displayedSnapshotTransitionGuide:
                                get(tasks, `${accountName}.hasDisplayedTransitionGuide`) || false,
                            // Migrate failed transactions (Transaction that were never broadcasted from this wallet)
                            transactions: [
                                ...accountData.transactions,
                                ...flatMap(get(failedBundleHashes, `${accountName}`), (transactions) =>
                                    map(transactions, (transaction) =>
                                        assign({}, transaction, { persistence: false, broadcasted: false }),
                                    ),
                                ),
                            ],
                        }),
                    );
                });
            });
        },
        Promise.resolve(),
    );
};
