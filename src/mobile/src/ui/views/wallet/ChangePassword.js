import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { setPassword, setSetting } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import { changePassword, hash } from 'libs/keychain';
import { generatePasswordHash, getSalt } from 'libs/crypto';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import CustomTextInput from 'ui/components/CustomTextInput';
import { Icon } from 'ui/theme/icons';
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
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topContainer: {
        flex: 11,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
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
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

/**
 * Change Password component
 */
class ChangePassword extends Component {
    static propTypes = {
        /** @ignore */
        currentPwdHash: PropTypes.object.isRequired,
        /** @ignore */
        setPassword: PropTypes.func.isRequired,
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
            currentPassword: '',
            newPassword: '',
            newPasswordReentry: '',
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('ChangePassword');
    }

    /**
     * Updates password in keychain and notifies user of successful password change
     *
     * @method onAcceptPassword
     */
    async onAcceptPassword() {
        const { currentPwdHash, setPassword, generateAlert, t } = this.props;
        const { newPassword } = this.state;
        const salt = await getSalt();
        const newPwdHash = await generatePasswordHash(newPassword, salt);
        changePassword(currentPwdHash, newPwdHash, salt)
            .then(() => {
                setPassword(newPwdHash);
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
        const { t, currentPwdHash, generateAlert } = this.props;
        const currentPasswordHash = await hash(this.state.currentPassword);
        if (!isEqual(currentPwdHash, currentPasswordHash)) {
            return generateAlert('error', t('incorrectPassword'), t('incorrectPasswordExplanation'));
        } else if (this.state.newPassword === this.state.currentPassword) {
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
                        <InfoBox
                            body={theme.body}
                            text={
                                <View>
                                    <Text style={[styles.infoText, textColor]}>{t('ensureStrongPassword')}</Text>
                                </View>
                            }
                        />
                        <View style={{ flex: 0.2 }} />
                        <CustomTextInput
                            onRef={(c) => {
                                this.currentPassword = c;
                            }}
                            value={currentPassword}
                            label={t('currentPassword')}
                            onChangeText={(password) => this.setState({ currentPassword: password })}
                            returnKeyType="next"
                            theme={theme}
                            widget="empty"
                            containerStyle={{ width: Styling.contentWidth }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            secureTextEntry
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
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('securitySettings')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={theme.body.color} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                        {currentPassword !== '' &&
                            newPassword !== '' &&
                            newPasswordReentry !== '' && (
                                <TouchableOpacity
                                    onPress={() => this.isPasswordChangeValid()}
                                    hitSlop={{
                                        top: height / 55,
                                        bottom: height / 55,
                                        left: width / 55,
                                        right: width / 55,
                                    }}
                                >
                                    <View style={styles.itemRight}>
                                        <Text style={[styles.titleTextRight, textColor]}>{t('global:save')}</Text>
                                        <Icon name="tick" size={width / 28} color={theme.body.color} />
                                    </View>
                                </TouchableOpacity>
                            )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    currentPwdHash: state.wallet.password,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setPassword,
    setSetting,
    generateAlert,
};

export default withNamespaces(['changePassword', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(ChangePassword),
);
