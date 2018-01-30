import get from 'lodash/get';
import Modal from 'react-native-modal';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import OnboardingButtons from './onboardingButtons';
import GENERAL from '../theme/general';
import THEMES from '../theme/themes';
import keychain, { getSeed } from '../util/keychain';
import { width, height } from '../util/dimensions';

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
    transitionButtonText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height / 40,
    },
});

class SnapshotTransition extends Component {
    static propTypes = {
        isTransitioning: PropTypes.bool.isRequired,
        backPress: PropTypes.func.isRequired,
        textColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
        borderColor: PropTypes.object.isRequired,
        transitionForSnapshot: PropTypes.func.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        seedIndex: PropTypes.number.isRequired,
        transitionBalance: PropTypes.number.isRequired,
        backgroundColor: PropTypes.object.isRequired,
        isCheckingBalance: PropTypes.bool.isRequired,
    };

    constructor() {
        super();
        this.state = {
            isModalVisible: false,
        };
    }

    componentWillReceiveProps(newProps) {
        const { isCheckingBalance } = this.props;
        if (!isCheckingBalance && newProps.isCheckingBalance) {
            this.showModal();
            console.log('balance');
        }
    }

    onSnapshotTransititionPress() {
        const { transitionForSnapshot, selectedAccountName, seedIndex, addresses } = this.props;
        keychain
            .get()
            .then(credentials => {
                const data = get(credentials, 'data');

                if (!data) {
                    throw new Error('Error');
                } else {
                    const seed = getSeed(data, seedIndex);
                    transitionForSnapshot(seed, selectedAccountName, addresses);
                }
            })
            .catch(err => console.error(err));
    }

    showModal = () => this.setState({ isModalVisible: true });

    hideModal = () => this.setState({ isModalVisible: false });

    renderModalContent = () => {
        const { transitionBalance, t, backgroundColor, borderColor, textColor } = this.props;

        return (
            <View
                style={[
                    { width: width / 1.15, alignItems: 'center' },
                    { backgroundColor: THEMES.getHSL(backgroundColor) },
                ]}
            >
                <View style={[styles.modalContent, borderColor]}>
                    <Text style={[styles.questionText, textColor]}>Detected balance: {transitionBalance}</Text>
                    <Text style={[styles.questionText, textColor]}>Is this correct?</Text>

                    <OnboardingButtons
                        // onLeftButtonPress={() => )}
                        // onRightButtonPress={() => this.props.logout()}
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
                    {isTransitioning && (
                        <View style={styles.innerContainer}>
                            <Text style={[styles.infoText, textColor]}>Transitioning for the snapshot</Text>
                            <Text style={[styles.infoText, textColor]}>Please wait...</Text>
                            <ActivityIndicator
                                animating={isTransitioning}
                                style={styles.activityIndicator}
                                size="large"
                                color={THEMES.getHSL(negativeColor)}
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
                    backdropColor={THEMES.getHSL(backgroundColor)}
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
