import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Modal from 'react-native-modal';
import Fonts from '../theme/Fonts';
import OnboardingButtons from '../components/onboardingButtons';
import { width, height } from '../util/dimensions';
import CustomTextInput from '../components/customTextInput';
import GENERAL from '../theme/general';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        paddingVertical: height / 18,
        width: width / 1.15,
    },
    topContainer: {
        flex: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flex: 2.5,
        justifyContent: 'space-around',
        paddingHorizontal: width / 15,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-end',
    },
    iconLeft: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    iconRight: {
        width: width / 28,
        height: width / 28,
    },
    titleTextRight: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
    infoText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 25.9,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 25.9,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

class DeleteAccount extends Component {
    static propTypes = {
        backPress: PropTypes.func.isRequired,
        password: PropTypes.string.isRequired,
        onWrongPassword: PropTypes.func.isRequired,
        deleteAccount: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        currentAccountName: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        textColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        borderColor: PropTypes.string.isRequired,
        arrowLeftImagePath: PropTypes.string.isRequired,
        tickImagePath: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.state = {
            isModalVisible: false,
            pressedContinue: false,
            password: '',
        };
    }

    onBackPress() {
        if (!this.state.pressedContinue) {
            this.props.backPress();
        } else {
            this.setState({ pressedContinue: false });
        }
    }

    onContinuePress() {
        if (!this.state.pressedContinue) {
            return this.setState({ pressedContinue: true });
        }
        if (this.state.password === this.props.password) {
            return this.showModal();
        }
        return this.props.onWrongPassword();
    }

    onYesPress() {
        this.hideModal();
        this.props.deleteAccount();
    }

    onNoPress() {
        this.hideModal();
    }

    showModal = () => this.setState({ isModalVisible: true });

    hideModal = () => this.setState({ isModalVisible: false });

    renderModalContent = (borderColor, textColor) => {
        const { t, backgroundColor, currentAccountName } = this.props;
        return (
            <View
                style={{
                    width: width / 1.15,
                    alignItems: 'center',
                    backgroundColor,
                }}
            >
                <View style={[styles.modalContent, borderColor]}>
                    <Text style={[styles.infoText, { paddingBottom: height / 16 }, textColor]}>
                        Are you sure you want to delete your account called {currentAccountName}?
                    </Text>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onNoPress()}
                        onRightButtonPress={() => this.onYesPress()}
                        leftText={t('global:no')}
                        rightText={t('global:yes')}
                    />
                </View>
            </View>
        );
    };

    render() {
        const {
            t,
            negativeColor,
            textColor,
            secondaryBackgroundColor,
            backgroundColor,
            borderColor,
            arrowLeftImagePath,
            tickImagePath,
        } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.3 }} />
                        {!this.state.pressedContinue && (
                            <View style={styles.textContainer}>
                                <Text style={[styles.infoText, textColor]}>{t('areYouSure')}</Text>
                                <Text style={[styles.infoText, textColor]}>{t('yourSeedWillBeRemoved')}</Text>
                                <Text style={[styles.warningText, { color: negativeColor }]}>{t('thisAction')}</Text>
                            </View>
                        )}
                        {this.state.pressedContinue && (
                            <View style={styles.textContainer}>
                                <Text style={[styles.infoText, textColor]}>{t('enterPassword')}</Text>
                                <CustomTextInput
                                    label={t('global:password')}
                                    onChangeText={(password) => this.setState({ password })}
                                    containerStyle={{ width: width / 1.36 }}
                                    autoCapitalize={'none'}
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    onSubmitEditing={this.handleLogin}
                                    secondaryBackgroundColor={secondaryBackgroundColor}
                                    negativeColor={negativeColor}
                                    secureTextEntry
                                    value={this.state.password}
                                />
                            </View>
                        )}
                        <View style={{ flex: 1.3 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.onBackPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.iconLeft} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.onContinuePress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:continue')}</Text>
                                <Image source={tickImagePath} style={styles.iconRight} />
                            </View>
                        </TouchableOpacity>
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
                        onBackButtonPress={() => this.setState({ isModalVisible: false })}
                    >
                        {this.renderModalContent(borderColor, textColor)}
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['deleteAccount', 'global'])(DeleteAccount);
