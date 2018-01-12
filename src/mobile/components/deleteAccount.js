import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Fonts from '../theme/Fonts';
import Colors from '../theme/Colors';
import OnboardingButtons from '../components/onboardingButtons.js';
import { width, height } from '../util/dimensions';
import Modal from 'react-native-modal';
import { TextField } from 'react-native-material-textfield';
import THEMES from '../theme/themes';
import GENERAL from '../theme/general';
import { translate } from 'react-i18next';

class DeleteAccount extends Component {
    constructor() {
        super();

        this.state = {
            isModalVisible: false,
            pressedContinue: false,
            password: '',
        };
    }

    _showModal = data => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    onBackPress() {
        if (!this.state.pressedContinue) {
            this.props.backPress();
        } else {
            this.setState({ pressedContinue: false });
        }
    }

    onContinuePress() {
        if (!this.state.pressedContinue) {
            this.setState({ pressedContinue: true });
        } else {
            if (this.state.password == this.props.password) {
                this._showModal();
            } else {
                this.props.onWrongPassword();
            }
        }
    }

    onYesPress() {
        this._hideModal();
        this.props.deleteAccount();
    }

    onNoPress() {
        this._hideModal();
    }

    _renderModalContent = (borderColor, textColor) => {
        const { t } = this.props;
        return (
            <View
                style={{
                    width: width / 1.15,
                    alignItems: 'center',
                    backgroundColor: THEMES.getHSL(this.props.backgroundColor),
                }}
            >
                <View style={[styles.modalContent, borderColor]}>
                    <Text style={[styles.infoText, { paddingBottom: height / 16 }, textColor]}>
                        Are you sure you want to delete your account called {this.props.currentAccountName}?
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
                                <Text style={[styles.warningText, { color: THEMES.getHSL(negativeColor) }]}>
                                    {t('thisAction')}
                                </Text>
                            </View>
                        )}
                        {this.state.pressedContinue && (
                            <View style={styles.textContainer}>
                                <Text style={[styles.infoText, textColor]}>{t('enterPassword')}</Text>
                                <TextField
                                    style={{ color: secondaryBackgroundColor, fontFamily: 'Lato-Light' }}
                                    labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                    labelFontSize={width / 31.8}
                                    fontSize={width / 20.7}
                                    labelPadding={3}
                                    baseColor={secondaryBackgroundColor}
                                    label={t('global:password')}
                                    tintColor={THEMES.getHSL(negativeColor)}
                                    autoCapitalize={'none'}
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically={true}
                                    returnKeyType="done"
                                    value={this.state.password}
                                    onChangeText={password => this.setState({ password })}
                                    containerStyle={{
                                        width: width / 1.4,
                                    }}
                                    secureTextEntry={true}
                                />
                            </View>
                        )}
                        <View style={{ flex: 1.3 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={event => this.onBackPress()}>
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.iconLeft} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.onContinuePress()}>
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
                        backdropColor={THEMES.getHSL(backgroundColor)}
                        backdropOpacity={0.6}
                        style={{ alignItems: 'center' }}
                        isVisible={this.state.isModalVisible}
                        onBackButtonPress={() => this.setState({ isModalVisible: false })}
                    >
                        {this._renderModalContent(borderColor, textColor)}
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

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
        width: width,
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

export default translate(['deleteAccount', 'global'])(DeleteAccount);
