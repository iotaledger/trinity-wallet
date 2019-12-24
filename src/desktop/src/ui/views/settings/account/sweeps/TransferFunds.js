import assign from 'lodash/assign';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import has from 'lodash/has';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import filter from 'lodash/filter';
import some from 'lodash/some';
import size from 'lodash/size';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import SeedStore from 'libs/SeedStore';

import { reset as resetProgress } from 'actions/progress';
import { recoverLockedFunds, setSweepsStatuses } from 'actions/sweeps';

import { getActiveSweepAddress, getActiveSweepInitialisationTime } from 'selectors/global';

import { moment } from 'libs/exports';

import { formatUnit, formatIotas } from 'libs/iota/utils';

import {
    getSelectedAccountName,
    getSelectedAccountMeta,
    getFilteredSpentAddressDataForSelectedAccount,
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
        /** @ignore */
        activeSweepAddress: PropTypes.string.isRequired,
        /** @ignore */
        activeSweepInitialisationTime: PropTypes.number.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            timeElapsed: {},
            spentAddressData: cloneDeep(props.spentAddressDataWithBalance),
        };
    }

    componentDidMount() {
        this.interval = setInterval(() => this.trackTime(), 1000);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.isRecoveringFunds && !newProps.isRecoveringFunds && !this.hasFailedAnySweep()) {
            this.props.history.push('/sweeps/done');
        }
    }

    componentWillUnmount() {
        this.props.setSweepsStatuses({});
        this.props.resetProgress();
        clearInterval(this.interval);
    }

    /**
     * Tracks total time taken for a sweep process
     *
     * @method trackTime
     *
     * @returns {void}
     */
    trackTime() {
        if (!isEmpty(this.props.activeSweepAddress) && this.props.activeSweepInitialisationTime !== -1) {
            this.setState((prevState) => ({
                timeElapsed: assign({}, prevState.timeElapsed, {
                    [this.props.activeSweepAddress]: this.getTimeElapsed(this.props.activeSweepInitialisationTime),
                }),
            }));
        }
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
        const { activeSteps, activeStepIndex, t } = this.props;

        if (hasFailed) {
            return t('global:failed');
        } else if (isInProgress) {
            return activeSteps[activeStepIndex];
        }

        return t('global:complete');
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

        return Math.round(((activeStepIndex + 1) / size(activeSteps)) * 100);
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

        return !isEmpty(sweepsStatuses) && some(Object.values(sweepsStatuses), (status) => status.status === -1);
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

    /**
     * Gets elapsed time for a single sweep process
     *
     * @method getTimeElapsed
     *
     * @returns {string}
     */
    getTimeElapsed(initialisationTime) {
        const startTime = moment(initialisationTime);
        const diff = moment().diff(startTime, 'minutes');

        if (diff === 0) {
            return `${moment().diff(startTime, 'seconds')} seconds`;
        }

        return diff > 1 ? `${diff} minutes` : `${diff} minute`;
    }

    /**
     * Gets address data for failed sweeps
     *
     * @method getSpentAddressDataForFailedSweeps
     *
     * @returns {array}
     */
    getSpentAddressDataForFailedSweeps() {
        const { sweepsStatuses } = this.props;
        const { spentAddressData } = this.state;

        const failedSweepAddresses = filter(keys(sweepsStatuses), (address) => sweepsStatuses[address].status === -1);

        return filter(spentAddressData, (addressObject) => includes(failedSweepAddresses, addressObject.address));
    }

    render() {
        const { isRecoveringFunds, latestAddress, sweepsStatuses, t } = this.props;
        const { spentAddressData } = this.state;

        const hasFailedAnySweep = this.hasFailedAnySweep();

        return (
            <form>
                <section>
                    <h1>{t('sweeps:transferYourFunds')}</h1>
                    <p>
                        <span>{t('sweeps:transferYourFundsExplanation')}</span>
                        <br />
                        <strong>{t('sweeps:doNotCloseTrinity').toUpperCase()}</strong>
                    </p>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {spentAddressData.map((object, index) => {
                            const statusObject = get(sweepsStatuses, object.address);
                            const status = get(statusObject, 'status');
                            const initialisationTime = get(statusObject, 'initialisationTime');

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
                                        >
                                            {`${t('sweeps:sweep')} ${index + 1} ${t('global:of')} ${
                                                spentAddressData.length
                                            }`}
                                        </strong>
                                        {has(sweepsStatuses, object.address) && (
                                            <span
                                                style={{
                                                    maxWidth: '365px',
                                                    minWidth: '340px',
                                                    marginRight: '40px',
                                                }}
                                            >
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Progress progress={this.getProgress(hasFailed, hasCompleted)} />
                                                    {get(sweepsStatuses[object.address], 'status') === 0 && (
                                                        <strong>
                                                            {t('global:timeElapsed')}:{' '}
                                                            {this.state.timeElapsed[object.address] ||
                                                                this.getTimeElapsed(initialisationTime)}
                                                        </strong>
                                                    )}
                                                </div>
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
                                            {t('sweeps:fromLockedAddress')}{' '}
                                            <strong title={object.inputAddress}>
                                                {object.address.slice(0, 9)} ... {object.address.slice(-3)}
                                            </strong>{' '}
                                            {t('sweeps:toSafeAddress')}{' '}
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
                        onClick={() => (hasFailedAnySweep ? this.props.history.goBack() : this.sweep(spentAddressData))}
                        disabled={isRecoveringFunds}
                        className="square"
                        variant={hasFailedAnySweep ? 'secondary' : 'primary'}
                    >
                        {t(hasFailedAnySweep ? 'cancel' : 'continue')}
                    </Button>
                    {hasFailedAnySweep && (
                        <Button
                            id="try-again"
                            onClick={() => this.sweep(this.getSpentAddressDataForFailedSweeps())}
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
    spentAddressDataWithBalance: getFilteredSpentAddressDataForSelectedAccount(state),
    broadcastedTransactions: getBroadcastedTransactionsForSelectedAccount(state),
    latestAddress: selectLatestAddressFromAccountFactory()(state),
    sweepsStatuses: state.wallet.sweepsStatuses,
    password: state.wallet.password,
    isRecoveringFunds: state.ui.isRecoveringFunds,
    activeStepIndex: state.progress.activeStepIndex,
    activeSteps: state.progress.activeSteps,
    activeSweepAddress: getActiveSweepAddress(state),
    activeSweepInitialisationTime: getActiveSweepInitialisationTime(state),
});

const mapDispatchToProps = {
    recoverLockedFunds,
    setSweepsStatuses,
    resetProgress,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TransferFunds));
