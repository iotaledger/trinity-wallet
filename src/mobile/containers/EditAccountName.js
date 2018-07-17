import trim from 'lodash/trim';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { translate } from 'react-i18next';
import { getSelectedAccountName } from 'iota-wallet-shared-modules/selectors/accounts';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { changeAccountName } from 'iota-wallet-shared-modules/actions/accounts';
import { updateAccountNameInKeychain } from '../utils/keychain';
import CustomTextInput from '../components/CustomTextInput';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import GENERAL from '../theme/general';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textFieldContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: height / 10,
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
});

/** Change account name component */
export class EditAccountName extends Component {
    static propTypes = {
        /** Account name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** List of all account names added to wallet */
        accountNames: PropTypes.array.isRequired,
        /** Hash for wallet's password */
        password: PropTypes.string.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Updates account name
         * @param {object} options - Contains old account name and new account name
         */
        changeAccountName: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            accountName: props.selectedAccountName,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('EditAccountName');
    }

    componentWillReceiveProps(newProps) {
        if (this.props.selectedAccountName !== newProps.selectedAccountName) {
            this.setState({ accountName: newProps.selectedAccountName });
        }
    }

    save(accountName) {
        const { accountNames, password, selectedAccountName, t } = this.props;

        if (accountNames.includes(accountName)) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:nameInUse'),
                t('addAdditionalSeed:nameInUseExplanation'),
            );
        } else {
            // Update keychain
            updateAccountNameInKeychain(password, selectedAccountName, accountName)
                .then(() => {
                    this.props.changeAccountName({
                        oldAccountName: selectedAccountName,
                        newAccountName: accountName,
                    });

                    this.props.setSetting('accountManagement');
                    this.props.generateAlert(
                        'success',
                        t('settings:nicknameChanged'),
                        t('settings:nicknameChangedExplanation'),
                    );
                })
                .catch((err) => console.log(err)); // eslint-disable-line no-console
        }
    }

    render() {
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.2 }} />
                        <View style={styles.textFieldContainer}>
                            <CustomTextInput
                                label={t('accountName')}
                                onChangeText={(accountName) => this.setState({ accountName })}
                                containerStyle={{ width: width / 1.15 }}
                                autoCapitalize="none"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                onSubmitEditing={() => this.save(trim(this.state.accountName))}
                                value={this.state.accountName}
                                theme={theme}
                            />
                        </View>
                        <View style={{ flex: 0.2 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('accountManagement')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={bodyColor} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.save(trim(this.state.accountName))}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:save')}</Text>
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
    selectedAccountName: getSelectedAccountName(state),
    accountNames: state.accounts.accountNames,
    password: state.wallet.password,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
    changeAccountName,
};

export default translate(['addAdditionalSeed', 'global', 'settings'])(
    connect(mapStateToProps, mapDispatchToProps)(EditAccountName),
);
