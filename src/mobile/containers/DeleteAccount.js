import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import PropTypes from 'prop-types';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Modal from 'react-native-modal';
import { getSelectedAccountName } from 'iota-wallet-shared-modules/selectors/accounts';
import { deleteAccount } from 'iota-wallet-shared-modules/actions/accounts';
import Fonts from '../theme/fonts';
import { deleteSeedFromKeychain } from '../utils/keychain';

import OnboardingButtons from '../containers/OnboardingButtons';
import { width, height } from '../utils/dimensions';
import { getPasswordHash } from '../utils/crypto';
import CustomTextInput from '../components/CustomTextInput';
import GENERAL from '../theme/general';
import { Icon } from '../theme/icons.js';

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
        width: width / 1.2,
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
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
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
    modalInfoText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 25.9,
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: width / 15,
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
        setSetting: PropTypes.func.isRequired,
        password: PropTypes.string.isRequired,
        deleteAccount: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        primaryColor: PropTypes.string.isRequired,
        textColor: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        bodyColor: PropTypes.string.isRequired,
        borderColor: PropTypes.object.isRequired,
        isPromoting: PropTypes.bool.isRequired,
        shouldPreventAction: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
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
            this.props.setSetting('accountManagement');
        } else {
            this.setState({ pressedContinue: false });
        }
    }

    onContinuePress() {
        const { password, t } = this.props;

        if (!this.state.pressedContinue) {
            return this.setState({ pressedContinue: true });
        }

        const pwdHash = getPasswordHash(this.state.password);

        if (password === pwdHash) {
            return this.showModal();
        }

        return this.props.generateAlert(
            'error',
            t('global:unrecognisedPassword'),
            t('global:unrecognisedPasswordExplanation'),
        );
    }

    onYesPress() {
        const { t, isPromoting } = this.props;
        if (isPromoting || this.props.shouldPreventAction()) {
            return this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }
        this.hideModal();
        this.props.deleteAccount();
    }

    onNoPress() {
        this.hideModal();
    }

    delete() {
        const { password, selectedAccountName } = this.props;

        deleteSeedFromKeychain(password, selectedAccountName)
            .then(() => this.props.deleteAccount(selectedAccountName))
            .catch((err) => console.error(err));
    }

    showModal = () => this.setState({ isModalVisible: true });

    hideModal = () => this.setState({ isModalVisible: false });

    renderModalContent = (borderColor, textColor) => {
        const { t, backgroundColor, selectedAccountName } = this.props;
        return (
            <View
                style={{
                    width: width / 1.2,
                    alignItems: 'center',
                    backgroundColor,
                }}
            >
                <View style={[styles.modalContent, borderColor]}>
                    <Text style={[styles.modalInfoText, { paddingBottom: height / 16 }, textColor]}>
                        {t('areYouSure', { accountName: selectedAccountName })}
                    </Text>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onNoPress()}
                        onRightButtonPress={() => this.onYesPress()}
                        leftText={t('global:no')}
                        rightText={t('global:yes')}
                        buttonWidth={{ width: width / 3.2 }}
                        containerWidth={{ width: width / 1.4 }}
                    />
                </View>
            </View>
        );
    };

    render() {
        const {
            t,
            primaryColor,
            textColor,
            bodyColor,
            backgroundColor,
            borderColor,
            theme,
            selectedAccountName,
        } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.5 }} />
                        {!this.state.pressedContinue && (
                            <View style={styles.textContainer}>
                                <Text style={[styles.infoText, textColor]}>
                                    {t('areYouSure', { accountName: selectedAccountName })}
                                </Text>
                                <Text style={[styles.infoText, textColor]}>{t('yourSeedWillBeRemoved')}</Text>
                                <Text style={[styles.warningText, { color: primaryColor }]}>{t('thisAction')}</Text>
                            </View>
                        )}
                        {this.state.pressedContinue && (
                            <View style={styles.textContainer}>
                                <Text style={[styles.infoText, textColor]}>{t('enterPassword')}</Text>
                                <CustomTextInput
                                    label={t('global:password')}
                                    onChangeText={(password) => this.setState({ password })}
                                    containerStyle={{ width: width / 1.36 }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    onSubmitEditing={this.handleLogin}
                                    theme={theme}
                                    secureTextEntry
                                    value={this.state.password}
                                />
                            </View>
                        )}
                        <View style={{ flex: 1.1 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.onBackPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={bodyColor} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.onContinuePress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:continue')}</Text>
                                <Icon name="tick" size={width / 28} color={bodyColor} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Modal
                        animationIn="bounceInUp"
                        animationOut="bounceOut"
                        animationInTiming={1000}
                        animationOutTiming={200}
                        backdropTransitionInTiming={500}
                        backdropTransitionOutTiming={200}
                        backdropColor={backgroundColor}
                        backdropOpacity={0.6}
                        style={{ alignItems: 'center' }}
                        isVisible={this.state.isModalVisible}
                        onBackButtonPress={() => this.setState({ isModalVisible: false })}
                        useNativeDriver
                        hideModalContentWhileAnimating
                    >
                        {this.renderModalContent(borderColor, textColor)}
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    password: state.wallet.password,
    selectedAccountName: getSelectedAccountName(state),
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
    deleteAccount,
};

export default translate(['deleteAccount', 'global'])(connect(mapStateToProps, mapDispatchToProps)(DeleteAccount));
