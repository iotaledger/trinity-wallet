import trim from 'lodash/trim';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { withNamespaces } from 'react-i18next';
import {
    getAccountNamesFromState,
    getSelectedAccountName,
    getSelectedAccountMeta,
} from 'shared-modules/selectors/accounts';
import { generateAlert } from 'shared-modules/actions/alerts';
import { setSetting } from 'shared-modules/actions/wallet';
import { changeAccountName } from 'shared-modules/actions/accounts';
import { shouldPreventAction, getThemeFromState } from 'shared-modules/selectors/global';
import SeedStore from 'libs/SeedStore';
import CustomTextInput from 'ui/components/CustomTextInput';
import SettingsDualFooter from 'ui/components/SettingsDualFooter';
import { height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
    },
    topContainer: {
        flex: 11,
        justifyContent: 'space-around',
    },
});

/** Change account name component */
export class EditAccountName extends Component {
    static propTypes = {
        /** Account name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Account meta for selected account */
        selectedAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        changeAccountName: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isAutoPromoting: PropTypes.bool.isRequired,
        /** Determines whether to allow account change */
        shouldPreventAction: PropTypes.bool.isRequired,
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

    /**
     * Updates new account name in store and keychain
     * Generates an alert if the user enters a duplicate account name
     *
     * @method save
     */
    async save(accountName) {
        const {
            accountNames,
            selectedAccountName,
            selectedAccountMeta,
            t,
            isAutoPromoting,
            shouldPreventAction,
        } = this.props;
        if (isAutoPromoting || shouldPreventAction) {
            return this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }
        if (accountName.length === 0) {
            return this.props.generateAlert(
                'error',
                t('addAdditionalSeed:noNickname'),
                t('addAdditionalSeed:noNicknameExplanation'),
            );
        } else if (accountNames.includes(accountName)) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:nameInUse'),
                t('addAdditionalSeed:nameInUseExplanation'),
            );
        } else if (isAutoPromoting || shouldPreventAction) {
            this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        } else {
            const seedStore = await new SeedStore[selectedAccountMeta.type](global.passwordHash, selectedAccountName);

            seedStore
                .accountRename(accountName)
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
        const { t, theme, selectedAccountName } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.3 }} />
                        <View style={styles.textFieldContainer}>
                            <CustomTextInput
                                label={t('accountName')}
                                onValidTextChange={(accountName) => this.setState({ accountName })}
                                autoCapitalize="none"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                onSubmitEditing={() => this.save(trim(this.state.accountName))}
                                value={this.state.accountName}
                                theme={theme}
                            />
                        </View>
                        <View style={{ flex: 0.1 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <SettingsDualFooter
                            hideActionButton={this.state.accountName === selectedAccountName}
                            theme={theme}
                            backFunction={() => this.props.setSetting('accountManagement')}
                            actionFunction={() => this.save(trim(this.state.accountName))}
                            actionName={t('global:save')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    selectedAccountName: getSelectedAccountName(state),
    selectedAccountMeta: getSelectedAccountMeta(state),
    accountNames: getAccountNamesFromState(state),
    theme: getThemeFromState(state),
    shouldPreventAction: shouldPreventAction(state),
    isAutoPromoting: state.polling.isAutoPromoting,
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
    changeAccountName,
};

export default withNamespaces(['addAdditionalSeed', 'global', 'settings'])(
    connect(mapStateToProps, mapDispatchToProps)(EditAccountName),
);
