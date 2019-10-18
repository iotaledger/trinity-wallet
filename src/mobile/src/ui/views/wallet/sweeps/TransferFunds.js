import get from 'lodash/get';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';
import some from 'lodash/some';
import size from 'lodash/size';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import SeedStore from 'libs/SeedStore';
import navigator from 'libs/navigation';
import { reset as resetProgress } from 'shared-modules/actions/progress';
import { recoverLockedFunds, setSweepsStatuses } from 'shared-modules/actions/sweeps';
import { formatUnit, formatIotas } from 'shared-modules/libs/iota/utils';
import {
    getSelectedAccountName,
    getSelectedAccountMeta,
    getSpentAddressDataWithBalanceForSelectedAccount,
    getBroadcastedTransactionsForSelectedAccount,
    selectLatestAddressFromAccountFactory,
} from 'shared-modules/selectors/accounts';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import OldProgressBar from 'ui/components/OldProgressBar';
import Header from 'ui/components/Header';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import InfoBox from 'ui/components/InfoBox';
import { Styling } from 'ui/theme/general';
import { height, width } from 'libs/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 0.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midWrapper: {
        flex: 2.2,
        justifyContent: 'center',
    },
    bottomWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontSize: Styling.fontSize3,
        fontFamily: 'SourceSansPro-Light',
        backgroundColor: 'transparent',
    },
    sweepHeader: {
        marginBottom: height / 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

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
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.state = {
            scrollable: false,
        };
    }

    componentWillUnmount() {
        this.props.setSweepsStatuses({});
        this.props.resetProgress();
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
     * Gets sweep progress
     *
     * @method getProgress
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

        return (activeStepIndex + 1) / size(activeSteps);
    }

    /**
     * Sets height of scrollable component
     *
     * @method setScrollable
     */
    setScrollable(y) {
        if (y >= height / 4) {
            return this.setState({ scrollable: true });
        }
        this.setState({ scrollable: false });
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
        const {
            theme: { body },
            spentAddressDataWithBalance,
            latestAddress,
            sweepsStatuses,
            t,
        } = this.props;

        const hasFailedAnySweep = this.hasFailedAnySweep();

        return (
            <View style={styles.container}>
                <View style={styles.topWrapper}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={400}
                    >
                        <Header textColor={body.color}>{t('sweeps:transferYourFunds')}</Header>
                    </AnimatedComponent>
                </View>
                <View style={styles.midWrapper}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={266}
                    >
                        <InfoBox>
                            <Text style={[styles.infoText, { color: body.color, textAlign: 'center' }]}>
                                {t('sweeps:transferYourFundsExplanation')}
                            </Text>
                            <Text
                                style={[
                                    styles.infoText,
                                    { color: body.color, paddingTop: height / 30, textAlign: 'center' },
                                ]}
                            >
                                {t('sweeps:doNotCloseTrinity').toUpperCase()}
                            </Text>
                        </InfoBox>
                    </AnimatedComponent>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={133}
                    >
                        <ScrollView
                            scrollEnabled={this.state.scrollable}
                            showsVerticalScrollIndicator={this.state.scrollable}
                            style={{
                                maxHeight: height / 4,
                                marginTop: height / 40,
                            }}
                            onContentSizeChange={(x, y) => this.setScrollable(y)}
                        >
                            {spentAddressDataWithBalance.map((object, index) => {
                                const status = get(sweepsStatuses, object.address);
                                const hasFailed = status === -1;
                                const isInProgress = status === 0;
                                const hasCompleted = status === 1;

                                return (
                                    <View key={index}>
                                        <View style={styles.sweepHeader}>
                                            <Text style={[styles.infoText, { color: body.color }]}>{`Sweep ${index +
                                                1} of ${spentAddressDataWithBalance.length}`}</Text>
                                            {has(sweepsStatuses, object.address) && (
                                                <OldProgressBar
                                                    width={width / 3}
                                                    height={height / 45}
                                                    progress={this.getProgress(hasFailed, hasCompleted)}
                                                />
                                            )}
                                            {has(sweepsStatuses, object.address) && (
                                                <Text style={[styles.infoText, { color: body.color }]}>
                                                    {this.getSweepStatus(hasFailed, isInProgress)}
                                                </Text>
                                            )}
                                        </View>
                                        <View>
                                            <Text
                                                style={[
                                                    styles.infoText,
                                                    { color: body.color, marginBottom: height / 40 },
                                                ]}
                                            >
                                                <Text>
                                                    {formatIotas(object.balance)} {formatUnit(object.balance)} from the
                                                    locked address{' '}
                                                </Text>
                                                <Text title={object.inputAddress}>
                                                    {object.address.slice(0, 9)} ... {object.address.slice(-3)}
                                                </Text>
                                                <Text title={object.outputAddress}>
                                                    {' '}
                                                    to the safe address {latestAddress.slice(0, 9)} ...{' '}
                                                    {latestAddress.slice(-3)}
                                                </Text>
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomWrapper}>
                    <DualFooterButtons
                        onLeftButtonPress={() => navigator.pop(this.props.componentId)}
                        onRightButtonPress={() =>
                            hasFailedAnySweep
                                ? navigator.pop(this.props.componentId)
                                : this.sweep(spentAddressDataWithBalance)
                        }
                        leftButtonText={t('back')}
                        rightButtonText={hasFailedAnySweep ? t('global:tryAgain') : t('global:continue')}
                    />
                </View>
            </View>
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
    currentSweepIteration: state.wallet.currentSweepIteration,
    totalSweepIterations: state.wallet.totalSweepIterations,
});

const mapDispatchToProps = {
    recoverLockedFunds,
    setSweepsStatuses,
    resetProgress,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation(['sweeps', 'global'])(TransferFunds));
