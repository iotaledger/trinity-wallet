import size from 'lodash/size';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { round } from 'iota-wallet-shared-modules/libs/utils';
import {
    setSetting,
    transitionForSnapshot,
    generateAddressesAndGetBalance,
    completeSnapshotTransition,
    setBalanceCheckFlag,
    cancelSnapshotTransition,
} from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { getSelectedAccountName, getAddressesForSelectedAccount } from 'iota-wallet-shared-modules/selectors/accounts';
import KeepAwake from 'react-native-keep-awake';
import { shouldPreventAction } from 'iota-wallet-shared-modules/selectors/global';
import { formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/iota/utils';
import ModalButtons from '../containers/ModalButtons';
import GENERAL from '../theme/general';
import { getSeedFromKeychain } from '../utils/keychain';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import CtaButton from '../components/CtaButton';
import InfoBox from '../components/InfoBox';
import ProgressBar from '../components/ProgressBar';
import { getMultiAddressGenFn, getPowFn } from '../utils/nativeModules';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

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
        fontSize: GENERAL.fontSize3,
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
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    buttonQuestionText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
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
        /** Snapshot transitioning state */
        isTransitioning: PropTypes.bool.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Make snapshot transition
         * @param {string} seed
         * @param {array} addresses
         */
        transitionForSnapshot: PropTypes.func.isRequired,
        /** Total computed balance during transition */
        transitionBalance: PropTypes.number.isRequired,
        /** Determines whether to display balance check */
        balanceCheckFlag: PropTypes.bool.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Generates addresses and checks for balance
         * @param {string} seed
         * @param {number} index
         * @param {function} genFn - Native address generation function
         */
        generateAddressesAndGetBalance: PropTypes.func.isRequired,
        /** Generated addresses during snapshot transition */
        transitionAddresses: PropTypes.array.isRequired,
        /** Attach addresses to tangle for completing snapshot transition
         * @param {string} seed
         * @param {string} selectedAccountName
         * @param {array} transitionAddresses
         */
        completeSnapshotTransition: PropTypes.func.isRequired,
        /** Currently selected account name */
        selectedAccountName: PropTypes.string.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Set new setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Addresses for selected account */
        addresses: PropTypes.array.isRequired,
        /** Determines whether to allow snapshot transition actions */
        shouldPreventAction: PropTypes.bool.isRequired,
        /** Attaching to tangle state */
        isAttachingToTangle: PropTypes.bool.isRequired,
        /** Wallet password  */
        password: PropTypes.object.isRequired,
        /** Whether to use remote PoW */
        remotePoW: PropTypes.bool.isRequired,
        activeStepIndex: PropTypes.number.isRequired,
        activeSteps: PropTypes.array.isRequired,
        setBalanceCheckFlag: PropTypes.func.isRequired,
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

    onBalanceCompletePress() {
        const { transitionAddresses, selectedAccountName, password, remotePoW } = this.props;
        setTimeout(() => {
            getSeedFromKeychain(password, selectedAccountName)
                .then((seed) => {
                    if (seed === null) {
                        throw new Error('Error');
                    } else {
                        let powFn = null;
                        if (remotePoW) {
                            powFn = getPowFn();
                        }
                        this.props.completeSnapshotTransition(seed, selectedAccountName, transitionAddresses, powFn);
                    }
                })
                .catch((err) => console.error(err));
        }, 300);
    }

    onBalanceIncompletePress() {
        const genFn = getMultiAddressGenFn();
        const { transitionAddresses, password, selectedAccountName } = this.props;
        const currentIndex = transitionAddresses.length;
        this.props.setBalanceCheckFlag(false);
        setTimeout(() => {
            getSeedFromKeychain(password, selectedAccountName).then((seed) => {
                if (seed === null) {
                    throw new Error('Error');
                } else {
                    this.props.generateAddressesAndGetBalance(seed, currentIndex, genFn);
                }
            });
        }, 300);
    }

    onSnapshotTransitionPress() {
        const { addresses, shouldPreventAction, password, selectedAccountName, t } = this.props;
        if (!shouldPreventAction) {
            const genFn = getMultiAddressGenFn();
            getSeedFromKeychain(password, selectedAccountName)
                .then((seed) => {
                    if (seed === null) {
                        throw new Error('Error');
                    } else {
                        this.props.transitionForSnapshot(seed, addresses, genFn);
                    }
                })
                .catch((err) => console.error(err));
        } else {
            this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }
    }

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
    shouldPreventAction: shouldPreventAction(state),
    addresses: getAddressesForSelectedAccount(state),
    isAttachingToTangle: state.ui.isAttachingToTangle,
    isTransitioning: state.ui.isTransitioning,
    isModalActive: state.ui.isModalActive,
    remotePoW: state.settings.remotePoW,
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

export default translate(['snapshotTransition', 'global', 'loading'])(
    connect(mapStateToProps, mapDispatchToProps)(SnapshotTransition),
);
