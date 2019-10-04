import assign from 'lodash/assign';
import get from 'lodash/get';
import filter from 'lodash/filter';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import some from 'lodash/some';
import size from 'lodash/size';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import SeedStore from 'libs/SeedStore';

import { reset as resetProgress } from 'actions/progress';
import { recoverLockedFunds, setSweepsStatuses } from 'actions/sweeps';

import { formatUnit, formatIotas } from 'libs/iota/utils';

import {
    getSelectedAccountName,
    getSelectedAccountMeta,
    getSpentAddressDataWithBalanceForSelectedAccount,
    getBroadcastedTransactionsForSelectedAccount,
    selectLatestAddressFromAccountFactory,
} from 'selectors/accounts';

import Button from 'ui/components/Button';
import Progress from 'ui/components/Progress';

/**
 * Sweep functionality "Transfer Funds" screen"
 */
class TransferFunds extends React.PureComponent {
    static propTypes = {
        /** Currently selected account name */
        accountName: PropTypes.string.isRequired,
        /** @ignore */
        accountMeta: PropTypes.object.isRequired,
        /** Spent address data with balance for selected account */
        spentAddressDataWithBalance: PropTypes.array.isRequired,
        /** Broadcasted transactions for selected account */
        broadcastedTransactions: PropTypes.array.isRequired,
        /** Latest (unused) address for selected account */
        latestAddress: PropTypes.string.isRequired,
        /** @ignore */
        password: PropTypes.object,
        /** @ignore */
        sweepsStatuses: PropTypes.object.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
            goBack: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        isRecoveringFunds: PropTypes.bool.isRequired,
        /** @ignore */
        activeStepIndex: PropTypes.number.isRequired,
        /** @ignore */
        activeSteps: PropTypes.array.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        recoverLockedFunds: PropTypes.func.isRequired,
        /** @ignore */
        setSweepsStatuses: PropTypes.func.isRequired,
        /** @ignore */
        resetProgress: PropTypes.func.isRequired,
    };

    componentWillUnmount() {
        this.props.setSweepsStatuses({});
        this.props.resetProgress();
    }

    /**
     * Gets address data
     *
     * @method getAddressData
     *
     * @returns {array}
     */
    getAddressData() {
        const { spentAddressDataWithBalance, broadcastedTransactions } = this.props;

        const inputTransactions = filter(broadcastedTransactions, (transaction) => transaction.value < 0);

        return filter(
            map(spentAddressDataWithBalance, (addreessObject) =>
                assign({}, addreessObject, {
                    bundleHashes: map(
                        filter(inputTransactions, (transaction) => transaction.address === addreessObject.address),
                        (transaction) => transaction.bundle,
                    ),
                }),
            ),
            (addressObject) => !isEmpty(addressObject.bundleHashes),
        );
    }

    /**
     * Gets sweep status
     *
     * @method getSweepStatus
     *
     * @param {boolean} hasFailed
     * @param {boolean} isInProgress
     *
     * @returns {string}
     */
    getSweepStatus(hasFailed, isInProgress) {
        if (hasFailed) {
            return 'Failed';
        } else if (isInProgress) {
            return 'In Progress';
        }

        return 'Completed';
    }

    /**
     * Renders sweep progress
     *
     * @method renderProgress
     *
     * @param {object} addressObject
     *
     * @returns {object}
     */
    getProgress(hasFailed, hasCompleted) {
        const { activeStepIndex, activeSteps } = this.props;

        // Check if sweep was failed.
        if (hasFailed || hasCompleted) {
            return 100;
        }

        return Math.round((activeStepIndex / size(activeSteps)) * 100);
    }

    /**
     * Determines if any sweep was unsuccessful
     *
     * @method hasFailedAnySweep
     *
     * @returns {boolean}
     */
    hasFailedAnySweep() {
        const { sweepsStatuses } = this.props;

        return !isEmpty(sweepsStatuses) && some(Object.values(sweepsStatuses), (status) => status === -1);
    }

    /**
     * Initiates sweep funds
     *
     * @method sweep
     *
     * @param {array} addressData - Result of #getAddressData
     *
     * @returns {void}
     */
    async sweep(addressData) {
        const { accountName, accountMeta, password } = this.props;
        const seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);

        this.props.recoverLockedFunds(accountName, seedStore, addressData);
    }

    render() {
        const { isRecoveringFunds, latestAddress, sweepsStatuses, t } = this.props;

        const mockAddressData = [
            {
                address: 'U'.repeat(81),
                bundleHashes: [],
                balance: 10000000,
                checksum: 'XXXUUUVVV',
                spent: { remote: true, local: true },
            },
        ];
        const addressData = [...this.getAddressData(), ...mockAddressData];
        const hasFailedAnySweep = this.hasFailedAnySweep();

        return (
            <form>
                <section>
                    <h1>{t('sweeps:transferYourFunds')}</h1>
                    <p>{t('sweeps:transferYourFundsExplanation')}</p>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {addressData.map((object, index) => {
                            const status = get(sweepsStatuses, object.address);

                            const hasFailed = status === -1;
                            const isInProgress = status === 0;
                            const hasCompleted = status === 1;

                            return (
                                <div
                                    key={index}
                                    style={{
                                        marginBottom: '30px',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            marginBottom: '10px',
                                        }}
                                    >
                                        <strong
                                            style={{
                                                marginRight: '40px',
                                            }}
                                        >{`Sweep ${index + 1} of ${addressData.length}`}</strong>
                                        {has(sweepsStatuses, object.address) && (
                                            <span
                                                style={{
                                                    maxWidth: '365px',
                                                    minWidth: '340px',
                                                    marginRight: '40px',
                                                }}
                                            >
                                                <Progress progress={this.getProgress(hasFailed, hasCompleted)} />
                                            </span>
                                        )}
                                        {has(sweepsStatuses, object.address) && (
                                            <span>
                                                <strong>{this.getSweepStatus(hasFailed, isInProgress)}</strong>
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                        }}
                                    >
                                        <span>
                                            <strong>
                                                {formatIotas(object.balance)} {formatUnit(object.balance)}{' '}
                                            </strong>{' '}
                                            from the locked address{' '}
                                            <strong title={object.inputAddress}>
                                                {object.address.slice(0, 9)} ... {object.address.slice(-3)}
                                            </strong>{' '}
                                            to the safe address{' '}
                                            <strong title={object.outputAddress}>
                                                {latestAddress.slice(0, 9)} ... {latestAddress.slice(-3)}
                                            </strong>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
                <footer>
                    <Button
                        id="sweep-funds-complete"
                        onClick={() => (hasFailedAnySweep ? this.props.history.goBack() : this.sweep(addressData))}
                        disabled={isRecoveringFunds}
                        className="square"
                        variant={hasFailedAnySweep ? 'secondary' : 'primary'}
                    >
                        {t(hasFailedAnySweep ? 'cancel' : 'continue')}
                    </Button>
                    {hasFailedAnySweep && (
                        <Button
                            id="try-again"
                            onClick={() => this.sweep(addressData)}
                            className="square"
                            variant="primary"
                        >
                            {t('sweeps:tryAgain')}
                        </Button>
                    )}
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    accountName: getSelectedAccountName(state),
    accountMeta: getSelectedAccountMeta(state),
    spentAddressDataWithBalance: getSpentAddressDataWithBalanceForSelectedAccount(state),
    broadcastedTransactions: getBroadcastedTransactionsForSelectedAccount(state),
    latestAddress: selectLatestAddressFromAccountFactory()(state),
    sweepsStatuses: state.wallet.sweepsStatuses,
    password: state.wallet.password,
    isRecoveringFunds: state.ui.isRecoveringFunds,
    activeStepIndex: state.progress.activeStepIndex,
    activeSteps: state.progress.activeSteps,
});

const mapDispatchToProps = {
    recoverLockedFunds,
    setSweepsStatuses,
    resetProgress,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(TransferFunds));
