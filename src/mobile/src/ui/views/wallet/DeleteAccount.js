import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import PropTypes from 'prop-types';
import { setSetting } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { getSelectedAccountName, getSelectedAccountMeta } from 'shared-modules/selectors/accounts';
import { shouldPreventAction, getThemeFromState } from 'shared-modules/selectors/global';
import { deleteAccount } from 'shared-modules/actions/accounts';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import Fonts from 'ui/theme/fonts';
import { hash } from 'libs/keychain';
import SeedStore from 'libs/SeedStore';
import { height } from 'libs/dimensions';
import CustomTextInput from 'ui/components/CustomTextInput';
import SettingsDualFooter from 'ui/components/SettingsDualFooter';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import InfoBox from 'ui/components/InfoBox';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topContainer: {
        flex: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 1,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    infoText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize3,
        textAlign: 'center',
    },
    infoBoxText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize3,
        textAlign: 'center',
    },
    infoBoxTitleText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize4,
        textAlign: 'center',
    },
    warningText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** Delete Account component */
class DeleteAccount extends Component {
    static propTypes = {
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        deleteAccount: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Currently selected account name */
        selectedAccountName: PropTypes.string.isRequired,
        /** Currently selected account meta */
        selectedAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isAutoPromoting: PropTypes.bool.isRequired,
        /** Determines whether to allow account deletion  */
        shouldPreventAction: PropTypes.bool.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            pressedContinue: false,
            password: null,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('DeleteAccount');
    }

    componentWillUnmount() {
        delete this.state.password;
    }

    /**
     * Navigates to account management setting screen
     *
     * @method onBackPress
     */
    onBackPress() {
        if (!this.state.pressedContinue) {
            this.props.setSetting('accountManagement');
        } else {
            this.setState({ pressedContinue: false });
        }
    }

    /**
     * Deletes account if user entered correct/valid password
     * Otherwise generates an alert
     *
     * @method onContinuePress
     */
    async onContinuePress() {
        const { t, isAutoPromoting } = this.props;
        if (!this.state.pressedContinue) {
            return this.setState({ pressedContinue: true });
        }
        if (isEmpty(this.state.password)) {
            return this.props.generateAlert('error', t('login:emptyPassword'), t('emptyPasswordExplanation'));
        } else if (isEqual(global.passwordHash, await hash(this.state.password))) {
            if (isAutoPromoting || this.props.shouldPreventAction) {
                return this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
            }
            return this.delete();
        }
        return this.props.generateAlert(
            'error',
            t('global:unrecognisedPassword'),
            t('global:unrecognisedPasswordExplanation'),
        );
    }

    showModal = () => {
        const { t, theme, selectedAccountName } = this.props;
        this.props.toggleModalActivity('deleteAccount', {
            t,
            theme,
            selectedAccountName,
            onNoPress: () => this.onNoPress(),
            onYesPress: () => this.onYesPress(),
        });
    };

    hideModal = () => {
        this.props.toggleModalActivity();
    };

    /**
     * Deletes account information from keychain and store
     *
     * @method delete
     */
    async delete() {
        const { selectedAccountName, selectedAccountMeta } = this.props;
        const seedStore = await new SeedStore[selectedAccountMeta.type](global.passwordHash, selectedAccountName);
        try {
            await seedStore.removeAccount();
        } catch (err) {
            console.log(err); //eslint-disable-line no-console
        }
        this.props.deleteAccount(selectedAccountName);
    }

    render() {
        const { t, theme, selectedAccountName } = this.props;

        const primaryColor = theme.primary.color;
        const textColor = { color: theme.body.color };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        {!this.state.pressedContinue && (
                            <View style={styles.textContainer}>
                                <InfoBox>
                                    <Text style={[styles.infoBoxTitleText, textColor]}>
                                        {t('global:account')}: {selectedAccountName}
                                    </Text>
                                    <Text style={[styles.infoBoxText, textColor, { paddingTop: height / 30 }]}>
                                        {t('areYouSure')}
                                    </Text>
                                    <Text style={[styles.infoBoxText, textColor, { paddingTop: height / 40 }]}>
                                        {t('yourSeedWillBeRemoved')}
                                    </Text>
                                </InfoBox>
                            </View>
                        )}
                        {this.state.pressedContinue && (
                            <View style={styles.textContainer}>
                                <Text style={[styles.warningText, { color: primaryColor }]}>
                                    {t('thisAction').toUpperCase()}
                                </Text>
                                <Text style={[styles.infoText, textColor, { paddingTop: height / 30 }]}>
                                    {t('enterPassword')}
                                </Text>
                                <CustomTextInput
                                    label={t('global:password')}
                                    onValidTextChange={(password) => this.setState({ password })}
                                    containerStyle={{ width: Styling.contentWidth, paddingTop: height / 20 }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    onSubmitEditing={this.handleLogin}
                                    theme={theme}
                                    secureTextEntry
                                    value={this.state.password}
                                    isPasswordInput
                                />
                            </View>
                        )}
                    </View>
                    <View style={styles.bottomContainer}>
                        <SettingsDualFooter
                            theme={theme}
                            backFunction={() => this.onBackPress()}
                            actionFunction={() => this.onContinuePress()}
                            actionName={this.state.pressedContinue ? t('delete') : t('global:continue')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    isAutoPromoting: state.polling.isAutoPromoting,
    selectedAccountName: getSelectedAccountName(state),
    selectedAccountMeta: getSelectedAccountMeta(state),
    shouldPreventAction: shouldPreventAction(state),
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
    deleteAccount,
    toggleModalActivity,
};

export default withTranslation(['deleteAccount', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(DeleteAccount),
);
