import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import PropTypes from 'prop-types';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import Modal from 'react-native-modal';
import { getSelectedAccountName } from 'iota-wallet-shared-modules/selectors/accounts';
import { shouldPreventAction } from 'iota-wallet-shared-modules/selectors/global';
import { deleteAccount } from 'iota-wallet-shared-modules/actions/accounts';
import { toggleModalActivity } from 'iota-wallet-shared-modules/actions/ui';
import StatefulDropdownAlert from '../containers/StatefulDropdownAlert';
import Fonts from '../theme/fonts';
import { deleteSeedFromKeychain, getPasswordHash } from '../utils/keychain';
import ModalButtons from '../containers/ModalButtons';
import { width, height } from '../utils/dimensions';
import CustomTextInput from '../components/CustomTextInput';
import GENERAL from '../theme/general';
import { Icon } from '../theme/icons.js';
import { isAndroid } from '../utils/device';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        width,
        height,
        justifyContent: 'center',
    },
    modal: {
        height,
        width,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
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
        flex: 11,
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
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
    infoText: {
        fontFamily: Fonts.secondary,
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    modalInfoText: {
        fontFamily: Fonts.secondary,
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: width / 15,
    },
    warningText: {
        fontFamily: Fonts.secondary,
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** Delete Account component */
class DeleteAccount extends Component {
    static propTypes = {
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Hash for wallet's password */
        password: PropTypes.object.isRequired,
        /** Removes account and associated information
         * @param {string} accountName
         */
        deleteAccount: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Currently selected account name */
        selectedAccountName: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Promotion state for polling */
        isAutoPromoting: PropTypes.bool.isRequired,
        /** Determines whether to allow account deletion  */
        shouldPreventAction: PropTypes.bool.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Sets whether modal is active or inactive */
        toggleModalActivity: PropTypes.func.isRequired,
        /** Determines whether modal is open */
        isModalActive: PropTypes.bool.isRequired,
    };

    constructor() {
        super();

        this.state = {
            pressedContinue: false,
            password: '',
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('DeleteAccount');
    }

    onBackPress() {
        if (!this.state.pressedContinue) {
            this.props.setSetting('accountManagement');
        } else {
            this.setState({ pressedContinue: false });
        }
    }

    async onContinuePress() {
        const { password, t } = this.props;

        if (!this.state.pressedContinue) {
            return this.setState({ pressedContinue: true });
        }

        const pwdHash = await getPasswordHash(this.state.password);

        if (isEqual(password, pwdHash)) {
            return this.showModal();
        }

        return this.props.generateAlert(
            'error',
            t('global:unrecognisedPassword'),
            t('global:unrecognisedPasswordExplanation'),
        );
    }

    onYesPress() {
        const { t, isAutoPromoting } = this.props;
        if (isAutoPromoting || this.props.shouldPreventAction) {
            return this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }
        this.hideModal();
        this.delete();
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

    showModal = () => {
        this.props.toggleModalActivity();
    };

    hideModal = () => {
        this.props.toggleModalActivity();
    };

    renderModalContent = (borderColor, textColor) => {
        const { t, theme, selectedAccountName } = this.props;
        const backgroundColor = { backgroundColor: theme.body.bg };

        return (
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, borderColor, backgroundColor]}>
                    <Text style={[styles.modalInfoText, { paddingBottom: height / 30 }, textColor]}>
                        {/*FIXME: localization*/}
                        {/*{t('areYouSure')}*/}
                        Are you sure you want to delete
                    </Text>
                    <Text style={[styles.modalInfoText, { paddingBottom: height / 16 }, textColor]}>
                        {selectedAccountName} ?
                    </Text>
                    <ModalButtons
                        onLeftButtonPress={() => this.onNoPress()}
                        onRightButtonPress={() => this.onYesPress()}
                        leftText={t('global:no')}
                        rightText={t('global:yes')}
                        buttonWidth={{ width: width / 3.2 }}
                        containerWidth={{ width: width / 1.4 }}
                    />
                </View>
                <StatefulDropdownAlert backgroundColor={theme.bar.bg} />
            </View>
        );
    };

    render() {
        const { t, theme, selectedAccountName, isModalActive } = this.props;

        const primaryColor = theme.primary.color;
        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;
        const backgroundColor = theme.body.bg;
        const borderColor = { borderColor: theme.body.color };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.5 }} />
                        {!this.state.pressedContinue && (
                            <View style={styles.textContainer}>
                                {/*FIXME: Investigate why Trans component doesn't work here*/}
                                {/*<Trans i18nKey="deleteAccount:areYouSure" accountName={selectedAccountName}>*/}
                                <View style={{ flex: 0.3 }} />
                                <Text style={[styles.infoText, textColor]}>Are you sure you want to delete</Text>
                                <View style={{ flex: 0.25 }} />
                                <Text style={[styles.infoText, textColor]}>{selectedAccountName}?</Text>
                                {/*</Trans>*/}
                                {/*eslint-enable react/jsx-boolean-value*/}
                                <View style={{ flex: 0.4 }} />
                                <Text style={[styles.infoText, textColor]}>{t('yourSeedWillBeRemoved')}</Text>
                                <View style={{ flex: 0.25 }} />
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
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:back')}</Text>
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
                        animationIn={isAndroid ? 'bounceInUp' : 'zoomIn'}
                        animationOut={isAndroid ? 'bounceOut' : 'zoomOut'}
                        animationInTiming={isAndroid ? 1000 : 300}
                        animationOutTiming={200}
                        backdropTransitionInTiming={isAndroid ? 500 : 300}
                        backdropTransitionOutTiming={200}
                        backdropColor={backgroundColor}
                        backdropOpacity={0.6}
                        style={styles.modal}
                        isVisible={isModalActive}
                        onBackButtonPress={() => this.props.toggleModalActivity()}
                        hideModalContentWhileAnimating
                        useNativeDriver={isAndroid ? true : false}
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
    theme: state.settings.theme,
    isAutoPromoting: state.polling.isAutoPromoting,
    selectedAccountName: getSelectedAccountName(state),
    shouldPreventAction: shouldPreventAction(state),
    isModalActive: state.ui.isModalActive,
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
    deleteAccount,
    toggleModalActivity,
};

export default translate(['deleteAccount', 'global'])(connect(mapStateToProps, mapDispatchToProps)(DeleteAccount));
