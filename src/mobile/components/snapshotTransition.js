import get from 'lodash/get';
import Modal from 'react-native-modal';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { round, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
import OnboardingButtons from './onboardingButtons';
import GENERAL from '../theme/general';
import keychain, { getSeed } from '../util/keychain';
import { width, height } from '../util/dimensions';
import { Icon } from '../theme/icons.js';
import CtaButton from '../components/ctaButton';
import InfoBox from '../components/infoBox';

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
        isTransitioning: PropTypes.bool.isRequired,
        backPress: PropTypes.func.isRequired,
        textColor: PropTypes.object.isRequired,
        primaryColor: PropTypes.string.isRequired,
        primary: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
        borderColor: PropTypes.object.isRequired,
        transitionForSnapshot: PropTypes.func.isRequired,
        seedIndex: PropTypes.number.isRequired,
        transitionBalance: PropTypes.number.isRequired,
        balanceCheckToggle: PropTypes.bool.isRequired,
        generateAddressesAndGetBalance: PropTypes.func.isRequired,
        transitionAddresses: PropTypes.array.isRequired,
        completeSnapshotTransition: PropTypes.func.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        generateAlert: PropTypes.func.isRequired,
        addresses: PropTypes.array.isRequired,
        shouldPreventAction: PropTypes.func.isRequired,
        isAttachingToTangle: PropTypes.bool.isRequired,
        body: PropTypes.object.isRequired,
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
        const { completeSnapshotTransition, seedIndex, transitionAddresses, selectedAccountName } = this.props;
        setTimeout(() => {
            keychain
                .get()
                .then((credentials) => {
                    const data = get(credentials, 'data');
                    if (!data) {
                        throw new Error('Error');
                    } else {
                        const seed = getSeed(data, seedIndex);
                        completeSnapshotTransition(seed, selectedAccountName, transitionAddresses);
                    }
                })
                .catch((err) => console.error(err));
        }, 300);
    }

    onBalanceIncompletePress() {
        this.hideModal();

        const { generateAddressesAndGetBalance, transitionAddresses, seedIndex } = this.props;
        const currentIndex = transitionAddresses.length;
        setTimeout(() => {
            keychain
                .get()
                .then((credentials) => {
                    const data = get(credentials, 'data');
                    if (!data) {
                        throw new Error('Error');
                    } else {
                        const seed = getSeed(data, seedIndex);
                        generateAddressesAndGetBalance(seed, currentIndex);
                    }
                })
                .catch((err) => console.error(err));
        }, 300);
    }

    onSnapshotTransititionPress() {
        const { transitionForSnapshot, seedIndex, addresses, shouldPreventAction } = this.props;

        if (!shouldPreventAction()) {
            keychain
                .get()
                .then((credentials) => {
                    const data = get(credentials, 'data');
                    if (!data) {
                        throw new Error('Error');
                    } else {
                        const seed = getSeed(data, seedIndex);
                        transitionForSnapshot(seed, addresses);
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
        const { transitionBalance, t, borderColor, textColor, body } = this.props;

        return (
            <View style={{ width: width / 1.05, alignItems: 'center', backgroundColor: body.bg }}>
                <View style={[styles.modalContent, borderColor]}>
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
        const {
            isTransitioning,
            backPress,
            body,
            textColor,
            primaryColor,
            primary,
            t,
            isAttachingToTangle,
        } = this.props;
        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={{ flex: 0.8 }} />
                    {!isTransitioning && (
                        <View style={styles.innerContainer}>
                            <InfoBox
                                body={body}
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
                                    ctaColor={primary.color}
                                    secondaryCtaColor={primary.body}
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
                                    body={body}
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
                                    color={primaryColor}
                                />
                            </View>
                        )}
                    {isTransitioning &&
                        isAttachingToTangle && (
                            <View style={styles.innerContainer}>
                                <InfoBox
                                    body={body}
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
                                    color={primaryColor}
                                />
                            </View>
                        )}
                </View>
                <View style={styles.bottomContainer}>
                    {!isTransitioning && (
                        <TouchableOpacity
                            onPress={() => backPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="chevronLeft" size={width / 28} color={body.color} />
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
                    backdropColor={body.bg}
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

export default SnapshotTransition;
