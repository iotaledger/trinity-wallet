import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { setSetting } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { changePassword, hash } from 'libs/keychain';
import { generatePasswordHash, getSalt } from 'libs/crypto';
import { Styling } from 'ui/theme/general';
import CustomTextInput from 'ui/components/CustomTextInput';
import SettingsDualFooter from 'ui/components/SettingsDualFooter';
import InfoBox from 'ui/components/InfoBox';
import PasswordFields from 'ui/components/PasswordFields';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1,
    },
    topContainer: {
        flex: 11,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/**
 * Change Password component
 */
class ChangePassword extends Component {
    static propTypes = {
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            currentPassword: null,
            newPassword: null,
            newPasswordReentry: null,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('ChangePassword');
    }

    componentWillUnmount() {
        delete this.state.currentPassword;
        delete this.state.newPassword;
        delete this.state.newPasswordReentry;
    }

    /**
     * Updates password in keychain and notifies user of successful password change
     *
     * @method onAcceptPassword
     */
    async onAcceptPassword() {
        const { generateAlert, t } = this.props;
        const { newPassword } = this.state;
        const salt = await getSalt();
        const newPwdHash = await generatePasswordHash(newPassword, salt);
        changePassword(global.passwordHash, newPwdHash, salt)
            .then(() => {
                global.passwordHash = newPwdHash;
                generateAlert('success', t('passwordUpdated'), t('passwordUpdatedExplanation'));
                this.props.setSetting('securitySettings');
            })
            .catch(() => generateAlert('error', t('somethingWentWrong'), t('somethingWentWrongTryAgain')));
    }

    /**
     * Checks if user has provided appropriate password change information
     *
     * @method isPasswordChangeValid
     */
    async isPasswordChangeValid() {
        const { t, generateAlert } = this.props;
        if (isEmpty(this.state.currentPassword)) {
            return this.props.generateAlert('error', t('login:emptyPassword'), t('emptyPasswordExplanation'));
        } else if (!isEqual(global.passwordHash, await hash(this.state.currentPassword))) {
            return generateAlert('error', t('incorrectPassword'), t('incorrectPasswordExplanation'));
        } else if (isEqual(this.state.newPassword, this.state.currentPassword)) {
            return generateAlert('error', t('oldPassword'), t('oldPasswordExplanation'));
        }
        this.passwordFields.checkPassword();
    }

    render() {
        const { currentPassword, newPassword, newPasswordReentry } = this.state;
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <InfoBox>
                            <Text style={[styles.infoText, textColor]}>{t('ensureStrongPassword')}</Text>
                        </InfoBox>
                        <CustomTextInput
                            onRef={(c) => {
                                this.currentPassword = c;
                            }}
                            value={currentPassword}
                            label={t('currentPassword')}
                            onValidTextChange={(password) => this.setState({ currentPassword: password })}
                            returnKeyType="next"
                            theme={theme}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            secureTextEntry
                            isPasswordInput
                        />
                        <PasswordFields
                            onRef={(ref) => {
                                this.passwordFields = ref;
                            }}
                            onAcceptPassword={() => this.onAcceptPassword()}
                            password={newPassword}
                            reentry={newPasswordReentry}
                            setPassword={(newPassword) => this.setState({ newPassword })}
                            setReentry={(newPasswordReentry) => this.setState({ newPasswordReentry })}
                        />
                        <View style={{ flex: 0.2 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <SettingsDualFooter
                            theme={theme}
                            hideActionButton={currentPassword === '' || newPassword === '' || newPasswordReentry === ''}
                            backFunction={() => this.props.setSetting('securitySettings')}
                            actionFunction={() => this.isPasswordChangeValid()}
                            actionName={t('global:save')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
};

export default withNamespaces(['changePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(ChangePassword),
);
