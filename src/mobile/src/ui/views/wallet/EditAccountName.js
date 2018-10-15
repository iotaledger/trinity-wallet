import trim from 'lodash/trim';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { withNamespaces } from 'react-i18next';
import {
    getAccountNamesFromState,
    getSelectedAccountName,
    getSelectedAccountType,
} from 'shared-modules/selectors/accounts';
import { generateAlert } from 'shared-modules/actions/alerts';
import { setSetting } from 'shared-modules/actions/wallet';
import { changeAccountName } from 'shared-modules/actions/accounts';
import SeedStore from 'libs/SeedStore';
import CustomTextInput from 'ui/components/CustomTextInput';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
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

/** Change account name component */
export class EditAccountName extends Component {
    static propTypes = {
        /** Account name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Account type for selected account */
        selectedAccountType: PropTypes.string.isRequired,
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
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
    save(accountName) {
        const { accountNames, password, selectedAccountName, selectedAccountType, t } = this.props;

        if (accountNames.includes(accountName)) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:nameInUse'),
                t('addAdditionalSeed:nameInUseExplanation'),
            );
        } else {
            const seedStore = new SeedStore[selectedAccountType](password, selectedAccountName);

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
                                containerStyle={{ width: Styling.contentWidth }}
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
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:back')}</Text>
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
    selectedAccountType: getSelectedAccountType(state),
    accountNames: getAccountNamesFromState(state),
    password: state.wallet.password,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
    changeAccountName,
};

export default withNamespaces(['addAdditionalSeed', 'global', 'settings'])(
    connect(mapStateToProps, mapDispatchToProps)(EditAccountName),
);
