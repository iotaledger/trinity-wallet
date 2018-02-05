import get from 'lodash/get';
import Modal from 'react-native-modal';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { round, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
import OnboardingButtons from './onboardingButtons';
import GENERAL from '../theme/general';
import keychain, { getSeed } from '../util/keychain';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: height / 30,
        width: width / 1.15,
        paddingHorizontal: width / 20,
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
        paddingVertical: height / 50,
        justifyContent: 'flex-end',
    },
    icon: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    transitionButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transitionButton: {
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    buttonInfoText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center',
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
        paddingBottom: height / 30,
    },
});

class SnapshotTransition extends Component {
    static propTypes = {
        isTransitioning: PropTypes.bool.isRequired,
        backPress: PropTypes.func.isRequired,
        textColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
        borderColor: PropTypes.object.isRequired,
        transitionForSnapshot: PropTypes.func.isRequired,
        seedIndex: PropTypes.number.isRequired,
        transitionBalance: PropTypes.number.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        balanceCheckToggle: PropTypes.bool.isRequired,
        generateAddressesAndGetBalance: PropTypes.func.isRequired,
        transitionAddresses: PropTypes.array.isRequired,
        completeSnapshotTransition: PropTypes.func.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        generateAlert: PropTypes.func.isRequired,
        addresses: PropTypes.array.isRequired,
        shouldPreventAction: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            isModalVisible: false,
        };
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
                .then(credentials => {
                    const data = get(credentials, 'data');
                    if (!data) {
                        throw new Error('Error');
                    } else {
                        const seed = getSeed(data, seedIndex);
                        completeSnapshotTransition(seed, selectedAccountName, transitionAddresses);
                    }
                })
                .catch(err => console.error(err));
        }, 300);
    }

    onBalanceIncompletePress() {
        this.hideModal();

        const { generateAddressesAndGetBalance, transitionAddresses, seedIndex } = this.props;
        const currentIndex = transitionAddresses.length;
        setTimeout(() => {
            keychain
                .get()
                .then(credentials => {
                    const data = get(credentials, 'data');
                    if (!data) {
                        throw new Error('Error');
                    } else {
                        const seed = getSeed(data, seedIndex);
                        generateAddressesAndGetBalance(seed, currentIndex);
                    }
                })
                .catch(err => console.error(err));
        }, 300);
    }

    onSnapshotTransititionPress() {
        const { transitionForSnapshot, seedIndex, addresses, shouldPreventAction } = this.props;

        if (!shouldPreventAction()) {
            keychain
                .get()
                .then(credentials => {
                    const data = get(credentials, 'data');
                    if (!data) {
                        throw new Error('Error');
                    } else {
                        const seed = getSeed(data, seedIndex);
                        transitionForSnapshot(seed, addresses);
                    }
                })
                .catch(err => console.error(err));
        } else {
            this.props.generateAlert('error', 'Please wait', 'Please wait and try again.');
        }
    }

    showModal = () => this.setState({ isModalVisible: true });

    hideModal = () => this.setState({ isModalVisible: false });

    renderModalContent = () => {
        const { transitionBalance, t, backgroundColor, borderColor, textColor } = this.props;

        return (
            <View style={{ width: width / 1.15, alignItems: 'center', backgroundColor }}>
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
            arrowLeftImagePath,
            backgroundColor,
            borderColor,
            textColor,
            negativeColor,
            t,
            isAttachingToTangle,
        } = this.props;
        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={{ flex: 0.8 }} />
                    {!isTransitioning && (
                        <View style={styles.innerContainer}>
                            <Text style={[styles.infoText, textColor]}>Has a snapshot taken place?</Text>
                            <Text style={[styles.infoText, textColor]}>Press the button below to transition.</Text>
                            <View style={styles.transitionButtonContainer}>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.onSnapshotTransititionPress();
                                    }}
                                >
                                    <View style={[styles.transitionButton, borderColor]}>
                                        <Text style={[styles.transitionButtonText, textColor]}>TRANSITION</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    {isTransitioning &&
                        !isAttachingToTangle && (
                            <View style={styles.innerContainer}>
                                <Text style={[styles.infoText, textColor]}>Transitioning for the snapshot</Text>
                                <Text style={[styles.infoText, textColor]}>Please wait...</Text>
                                <ActivityIndicator
                                    animating={isTransitioning}
                                    style={styles.activityIndicator}
                                    size="large"
                                    color={negativeColor}
                                />
                            </View>
                        )}
                    {isTransitioning &&
                        isAttachingToTangle && (
                            <View style={styles.innerContainer}>
                                <Text style={[styles.infoText, textColor]}>Attaching addresses to Tangle</Text>
                                <Text style={[styles.infoText, textColor]}>This may take a while</Text>
                                <Text style={[styles.infoText, textColor]}>Please wait...</Text>
                                <ActivityIndicator
                                    animating={isTransitioning}
                                    style={styles.activityIndicator}
                                    size="large"
                                    color={negativeColor}
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
                                <Image source={arrowLeftImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
                <Modal
                    animationIn={'bounceInUp'}
                    animationOut={'bounceOut'}
                    animationInTiming={1000}
                    animationOutTiming={200}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={200}
                    backdropColor={backgroundColor}
                    backdropOpacity={0.6}
                    style={{ alignItems: 'center' }}
                    isVisible={this.state.isModalVisible}
                    onBackButtonPress={() => this.hideModal()}
                >
                    {this.renderModalContent()}
                </Modal>
            </View>
        );
    }
}

export default SnapshotTransition;
