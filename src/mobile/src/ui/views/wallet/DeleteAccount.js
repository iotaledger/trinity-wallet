import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import PropTypes from 'prop-types';
import { setSetting } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { getSelectedAccountName, getSelectedAccountMeta } from 'shared-modules/selectors/accounts';
import { shouldPreventAction } from 'shared-modules/selectors/global';
import { deleteAccount } from 'shared-modules/actions/accounts';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import Fonts from 'ui/theme/fonts';
import { hash } from 'libs/keychain';
import SeedStore from 'libs/SeedStore';
import { width, height } from 'libs/dimensions';
import CustomTextInput from 'ui/components/CustomTextInput';
import { Styling } from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';
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
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flex: 2.5,
        alignItems: 'center',
        justifyContent: 'space-around',
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
        this.setState({ password: null });
        // gc
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
        if (isEqual(global.passwordHash, await hash(this.state.password))) {
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

    /**
     * Deletes account information from keychain and store
     *
     * @method delete
     */
    async delete() {
        const { selectedAccountName, selectedAccountMeta } = this.props;
        const seedStore = new SeedStore[selectedAccountMeta.type](global.passwordHash, selectedAccountName);
        await seedStore.removeAccount();
        this.props.deleteAccount(selectedAccountName);
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

    render() {
        const { t, theme, selectedAccountName } = this.props;

        const primaryColor = theme.primary.color;
        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.5 }} />
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
                                <Text style={[styles.infoText, textColor]}>{t('enterPassword')}</Text>
                                <CustomTextInput
                                    label={t('global:password')}
                                    onChangeText={(password) => this.setState({ password })}
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
                                <Text style={[styles.titleTextRight, textColor]}>
                                    {this.state.pressedContinue ? t('delete') : t('global:continue')}
                                </Text>
                                <Icon name="tick" size={width / 28} color={bodyColor} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
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

export default withNamespaces(['deleteAccount', 'global'])(connect(mapStateToProps, mapDispatchToProps)(DeleteAccount));
