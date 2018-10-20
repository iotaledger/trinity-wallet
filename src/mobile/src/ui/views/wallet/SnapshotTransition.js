import size from 'lodash/size';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { round } from 'shared-modules/libs/utils';
import {
    setSetting,
    transitionForSnapshot,
    generateAddressesAndGetBalance,
    completeSnapshotTransition,
    setBalanceCheckFlag,
    cancelSnapshotTransition,
} from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import {
    getSelectedAccountName,
    getSelectedAccountType,
    getAddressesForSelectedAccount,
} from 'shared-modules/selectors/accounts';
import KeepAwake from 'react-native-keep-awake';
import { shouldPreventAction } from 'shared-modules/selectors/global';
import { formatValue, formatUnit } from 'shared-modules/libs/iota/utils';
import ModalButtons from 'ui/components/ModalButtons';
import { Styling } from 'ui/theme/general';
import SeedStore from 'libs/SeedStore';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import CtaButton from 'ui/components/CtaButton';
import InfoBox from 'ui/components/InfoBox';
import ProgressBar from 'ui/components/ProgressBar';
import { getPowFn } from 'libs/nativeModules';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topContainer: {
        flex: 11,
        justifyContent: 'center',
    },
    innerContainer: {
        flex: 4,
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    transitionButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonInfoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    buttonQuestionText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        paddingTop: height / 60,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height / 40,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: height / 60,
        marginBottom: height / 20,
    },
    balanceCheckContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

class SnapshotTransition extends Component {
    static propTypes = {
        /** @ignore */
        isTransitioning: PropTypes.bool.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        transitionForSnapshot: PropTypes.func.isRequired,
        /** @ignore */
        transitionBalance: PropTypes.number.isRequired,
        /** @ignore */
        balanceCheckFlag: PropTypes.bool.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        generateAddressesAndGetBalance: PropTypes.func.isRequired,
        /** @ignore */
        transitionAddresses: PropTypes.array.isRequired,
        /** @ignore */
        completeSnapshotTransition: PropTypes.func.isRequired,
        /** Currently selected account name */
        selectedAccountName: PropTypes.string.isRequired,
        /** Currently selected account type */
        selectedAccountType: PropTypes.string.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** Addresses for selected account */
        addresses: PropTypes.array.isRequired,
        /** Determines whether to allow snapshot transition actions */
        shouldPreventAction: PropTypes.bool.isRequired,
        /** @ignore */
        isAttachingToTangle: PropTypes.bool.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        activeStepIndex: PropTypes.number.isRequired,
        /** @ignore */
        activeSteps: PropTypes.array.isRequired,
        /** @ignore */
        setBalanceCheckFlag: PropTypes.func.isRequired,
        /** @ignore */
        cancelSnapshotTransition: PropTypes.func.isRequired,
    };

    static renderProgressBarChildren(activeStepIndex, sizeOfActiveSteps) {
        if (activeStepIndex === -1) {
            return null;
        }

        return `Attaching address ${activeStepIndex + 1} / ${sizeOfActiveSteps}`;
    }

    constructor() {
        super();
        this.onSnapshotTransitionPress = this.onSnapshotTransitionPress.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('SnapshotTransition');
    }

    componentWillReceiveProps(newProps) {
        const { isTransitioning } = this.props;
        if (!isTransitioning && newProps.isSendingTransfer) {
            KeepAwake.activate();
        } else if (isTransitioning && !newProps.isSendingTransfer) {
            KeepAwake.deactivate();
        }
    }

    /**
     * Dispatch an action to complete snapshot transition (Start attaching addresses to Tangle)
     * @method onBalanceCompletePress
     */
    onBalanceCompletePress() {
        const { transitionAddresses, selectedAccountName, selectedAccountType, password } = this.props;
        setTimeout(() => {
            const seedStore = new SeedStore[selectedAccountType](password, selectedAccountName);
            this.props.completeSnapshotTransition(seedStore, selectedAccountName, transitionAddresses, getPowFn());
        }, 300);
    }

    /**
     * Generates bulk of addresses if a user doesn't find their correct balance
     * @method onBalanceIncompletePress
     */
    onBalanceIncompletePress() {
        const { transitionAddresses, password, selectedAccountName, selectedAccountType } = this.props;
        const currentIndex = transitionAddresses.length;
        this.props.setBalanceCheckFlag(false);
        setTimeout(() => {
            const seedStore = new SeedStore[selectedAccountType](password, selectedAccountName);
            this.props.generateAddressesAndGetBalance(seedStore, currentIndex);
        }, 300);
    }

    /**
     * Generates a bulk of addresses starting from index 0
     * Finds balance for those addresses and displays a modal asking the user to confirm the balance
     * @method onSnapshotTransitionPress
     */
    onSnapshotTransitionPress() {
        const { addresses, shouldPreventAction, password, selectedAccountName, selectedAccountType, t } = this.props;
        if (!shouldPreventAction) {
            const seedStore = new SeedStore[selectedAccountType](password, selectedAccountName);
            this.props.transitionForSnapshot(seedStore, addresses);
        } else {
            this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }
    }

    /**
     * Cancels snapshot transition and navigates to advanced settings screen
     * @method cancel
     */
    cancel() {
        this.props.cancelSnapshotTransition();
        this.props.setSetting('advancedSettings');
    }

    render() {
        const {
            isTransitioning,
            theme,
            t,
            isAttachingToTangle,
            activeStepIndex,
            activeSteps,
            balanceCheckFlag,
            transitionBalance,
        } = this.props;
        const textColor = { color: theme.body.color };

        const sizeOfActiveSteps = size(activeSteps);

        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={{ flex: 0.8 }} />
                    {!isTransitioning && (
                        <View style={styles.innerContainer}>
                            <InfoBox
                                body={theme.body}
                                text={
                                    <View>
                                        <Text style={[styles.infoText, textColor]}>{t('snapshotExplanation')}</Text>
                                        <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                            {t('hasSnapshotTakenPlace')}
                                        </Text>
                                    </View>
                                }
                            />
                            <View style={styles.transitionButtonContainer}>
                                <CtaButton
                                    ctaColor={theme.primary.color}
                                    secondaryCtaColor={theme.primary.body}
                                    text={t('transition')}
                                    onPress={this.onSnapshotTransitionPress}
                                    ctaWidth={width / 2}
                                    ctaHeight={height / 16}
                                />
                            </View>
                        </View>
                    )}
                    {isTransitioning &&
                        !isAttachingToTangle && (
                            <View style={styles.innerContainer}>
                                {(balanceCheckFlag && (
                                    <InfoBox
                                        body={theme.body}
                                        width={width / 1.1}
                                        text={
                                            <View style={styles.balanceCheckContainer}>
                                                <View style={styles.textContainer}>
                                                    <Text style={[styles.buttonInfoText, textColor]}>
                                                        {t('detectedBalance', {
                                                            amount: round(formatValue(transitionBalance), 1),
                                                            unit: formatUnit(transitionBalance),
                                                        })}
                                                    </Text>
                                                    <Text style={[styles.buttonQuestionText, textColor]}>
                                                        {t('isThisCorrect')}
                                                    </Text>
                                                </View>
                                                <ModalButtons
                                                    onLeftButtonPress={() => this.onBalanceIncompletePress()}
                                                    onRightButtonPress={() => this.onBalanceCompletePress()}
                                                    leftText={t('global:no')}
                                                    rightText={t('global:yes')}
                                                    containerWidth={{ width: width / 1.25 }}
                                                    buttonWidth={{ width: width / 2.85 }}
                                                />
                                            </View>
                                        }
                                    />
                                )) || (
                                    <ActivityIndicator
                                        animating={isTransitioning}
                                        style={styles.activityIndicator}
                                        size="large"
                                        color={theme.primary.color}
                                    />
                                )}
                                <View style={{ flex: 0.45 }} />
                            </View>
                        )}
                    {isTransitioning &&
                        isAttachingToTangle && (
                            <View style={styles.innerContainer}>
                                <InfoBox
                                    body={theme.body}
                                    text={
                                        <View>
                                            <Text style={[styles.infoText, textColor]}>{t('attaching')}</Text>
                                            <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                                {t('loading:thisMayTake')}
                                            </Text>
                                            <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                                {t('global:pleaseWaitEllipses')}
                                            </Text>
                                        </View>
                                    }
                                />
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <ProgressBar
                                        style={{
                                            textWrapper: { flex: 0.4 },
                                        }}
                                        indeterminate={activeStepIndex === -1}
                                        progress={activeStepIndex / sizeOfActiveSteps}
                                        color={theme.primary.color}
                                        textColor={theme.body.color}
                                    >
                                        {SnapshotTransition.renderProgressBarChildren(
                                            activeStepIndex,
                                            sizeOfActiveSteps,
                                        )}
                                    </ProgressBar>
                                </View>
                            </View>
                        )}
                </View>
                <View style={styles.bottomContainer}>
                    {!isAttachingToTangle && (
                        <TouchableOpacity
                            onPress={() =>
                                isTransitioning ? this.cancel() : this.props.setSetting('advancedSettings')
                            }
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="chevronLeft" size={width / 28} color={theme.body.color} />
                                <Text style={[styles.titleText, textColor]}>
                                    {isTransitioning ? t('global:cancel') : t('global:back')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    transitionBalance: state.wallet.transitionBalance,
    balanceCheckFlag: state.wallet.balanceCheckFlag,
    transitionAddresses: state.wallet.transitionAddresses,
    password: state.wallet.password,
    selectedAccountName: getSelectedAccountName(state),
    selectedAccountType: getSelectedAccountType(state),
    shouldPreventAction: shouldPreventAction(state),
    addresses: getAddressesForSelectedAccount(state),
    isAttachingToTangle: state.ui.isAttachingToTangle,
    isTransitioning: state.ui.isTransitioning,
    activeStepIndex: state.progress.activeStepIndex,
    activeSteps: state.progress.activeSteps,
});

const mapDispatchToProps = {
    setSetting,
    transitionForSnapshot,
    generateAddressesAndGetBalance,
    completeSnapshotTransition,
    generateAlert,
    setBalanceCheckFlag,
    cancelSnapshotTransition,
};

export default withNamespaces(['snapshotTransition', 'global', 'loading'])(
    connect(mapStateToProps, mapDispatchToProps)(SnapshotTransition),
);
