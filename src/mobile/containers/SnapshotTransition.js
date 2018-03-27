import Modal from 'react-native-modal';
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
    completeSnapshotTransition
} from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { getSelectedAccountName, getAddressesForSelectedAccount } from 'iota-wallet-shared-modules/selectors/accounts';
import { shouldPreventAction } from 'iota-wallet-shared-modules/selectors/global';
import { formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/iota/utils';
import OnboardingButtons from '../containers/OnboardingButtons';
import GENERAL from '../theme/general';
import { getSeedFromKeychain } from '../utils/keychain';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import CtaButton from '../components/CtaButton';
import InfoBox from '../components/InfoBox';

const styles = StyleSheet.create({
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        width: width / 1.05,
        paddingHorizontal: width / 20,
        paddingBottom: height / 25,
    },
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
        flex: 9,
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
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    transitionButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonInfoText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    buttonQuestionText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
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
        width: width / 1.25,
        marginVertical: height / 20,
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
        /** Determines whether to display balance check modal or not */
        balanceCheckToggle: PropTypes.bool.isRequired,
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
        password: PropTypes.string.isRequired,
    };

    constructor() {
        super();
        this.state = {
            isModalVisible: false,
        };

        this.onSnapshotTransititionPress = this.onSnapshotTransititionPress.bind(this);
    }

    componentWillReceiveProps(newProps) {
        const { balanceCheckToggle, isTransitioning } = this.props;
        if (balanceCheckToggle !== newProps.balanceCheckToggle) {
            this.showModal();
        }

        if (isTransitioning && !newProps.isTransitioning) {
            this.hideModal();
        }
    }

    onBalanceCompletePress() {
        this.hideModal();
        const { transitionAddresses, selectedAccountName, password } = this.props;
        setTimeout(() => {
            getSeedFromKeychain(password, selectedAccountName)
                .then((seed) => {
                    if (seed === null) {
                        throw new Error('Error');
                    } else {
                        this.props.completeSnapshotTransition(seed, selectedAccountName, transitionAddresses);
                    }
                })
                .catch((err) => console.error(err));
        }, 300);
    }

    onBalanceIncompletePress() {
        this.hideModal();

        const { transitionAddresses, password, selectedAccountName } = this.props;
        const currentIndex = transitionAddresses.length;
        setTimeout(() => {
            getSeedFromKeychain(password, selectedAccountName).then((seed) => {
                if (seed === null) {
                    throw new Error('Error');
                } else {
                    this.props.generateAddressesAndGetBalance(seed, currentIndex);
                }
            });
        }, 300);
    }

    onSnapshotTransititionPress() {
        const { addresses, shouldPreventAction, password, selectedAccountName } = this.props;

        if (!shouldPreventAction) {
            getSeedFromKeychain(password, selectedAccountName)
                .then((seed) => {
                    if (seed === null) {
                        throw new Error('Error');
                    } else {
                        this.props.transitionForSnapshot(seed, addresses);
                    }
                })
                .catch((err) => console.error(err));
        } else {
            this.props.generateAlert('error', 'Please wait', 'Please wait and try again.');
        }
    }

    showModal = () => this.setState({ isModalVisible: true });

    hideModal = () => this.setState({ isModalVisible: false });

    renderModalContent = () => {
        const { transitionBalance, t, theme } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <View style={{ width: width / 1.05, alignItems: 'center', backgroundColor: theme.body.bg }}>
                <View style={[styles.modalContent, { borderColor: theme.body.color }]}>
                    <View style={styles.textContainer}>
                        <Text style={[styles.buttonInfoText, textColor]}>
                            Detected balance: {round(formatValue(transitionBalance), 1)} {formatUnit(transitionBalance)}
                        </Text>
                        <Text style={[styles.buttonQuestionText, textColor]}>Is this correct?</Text>
                    </View>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onBalanceIncompletePress()}
                        onRightButtonPress={() => this.onBalanceCompletePress()}
                        leftText={t('global:no')}
                        rightText={t('global:yes')}
                    />
                </View>
            </View>
        );
    };

    render() {
        const { isTransitioning, theme, t, isAttachingToTangle } = this.props;
        const textColor = { color: theme.body.color };

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
                                        <Text style={[styles.infoText, textColor]}>
                                            Every so often, a snapshot is performed to prune the size of the Tangle.
                                        </Text>
                                        <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                            Has a snapshot taken place? Press the button below to transition.
                                        </Text>
                                    </View>
                                }
                            />
                            <View style={styles.transitionButtonContainer}>
                                <CtaButton
                                    ctaColor={theme.primary.color}
                                    secondaryCtaColor={theme.primary.body}
                                    text="TRANSITION"
                                    onPress={this.onSnapshotTransititionPress}
                                    ctaWidth={width / 2}
                                    ctaHeight={height / 16}
                                />
                            </View>
                        </View>
                    )}
                    {isTransitioning &&
                        !isAttachingToTangle && (
                            <View style={styles.innerContainer}>
                                <InfoBox
                                    body={theme.body}
                                    text={
                                        <View>
                                            <Text style={[styles.infoText, textColor]}>
                                                Transitioning for the snapshot.
                                            </Text>
                                            <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                                Generating addresses and detecting balance.
                                            </Text>
                                            <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                                Please wait...
                                            </Text>
                                        </View>
                                    }
                                />
                                <ActivityIndicator
                                    animating={isTransitioning}
                                    style={styles.activityIndicator}
                                    size="large"
                                    color={theme.primary.color}
                                />
                            </View>
                        )}
                    {isTransitioning &&
                        isAttachingToTangle && (
                            <View style={styles.innerContainer}>
                                <InfoBox
                                    body={theme.body}
                                    text={
                                        <View>
                                            <Text style={[styles.infoText, textColor]}>
                                                Attaching addresses to Tangle
                                            </Text>
                                            <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                                This may take a while
                                            </Text>
                                            <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                                Please wait...
                                            </Text>
                                        </View>
                                    }
                                />
                                <ActivityIndicator
                                    animating={isTransitioning}
                                    style={styles.activityIndicator}
                                    size="large"
                                    color={theme.primary.color}
                                />
                            </View>
                        )}
                </View>
                <View style={styles.bottomContainer}>
                    {!isTransitioning && (
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('advancedSettings')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="chevronLeft" size={width / 28} color={theme.body.color} />
                                <Text style={[styles.titleText, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
                <Modal
                    animationIn="bounceInUp"
                    animationOut="bounceOut"
                    animationInTiming={1000}
                    animationOutTiming={200}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={200}
                    backdropColor={theme.body.bg}
                    backdropOpacity={0.6}
                    style={{ alignItems: 'center' }}
                    isVisible={this.state.isModalVisible}
                    onBackButtonPress={() => this.hideModal()}
                    useNativeDriver
                    hideModalContentWhileAnimating
                >
                    {this.renderModalContent()}
                </Modal>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    transitionBalance: state.wallet.transitionBalance,
    balanceCheckToggle: state.wallet.balanceCheckToggle,
    transitionAddresses: state.wallet.transitionAddresses,
    password: state.wallet.password,
    selectedAccountName: getSelectedAccountName(state),
    shouldPreventAction: shouldPreventAction(state),
    addresses: getAddressesForSelectedAccount(state),
    isAttachingToTangle: state.ui.isAttachingToTangle,
    isTransitioning: state.ui.isTransitioning,
});

const mapDispatchToProps = {
    setSetting,
    transitionForSnapshot,
    generateAddressesAndGetBalance,
    completeSnapshotTransition,
    generateAlert
};

export default translate(['global'])(
    connect(mapStateToProps, mapDispatchToProps)(SnapshotTransition),
);
