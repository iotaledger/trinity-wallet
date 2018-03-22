import map from 'lodash/map';
import trim from 'lodash/trim';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { translate } from 'react-i18next';
import { getSelectedAccountNameViaSeedIndex } from 'iota-wallet-shared-modules/selectors/account';
import { renameKeys } from 'iota-wallet-shared-modules/libs/util';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { setSetting } from 'iota-wallet-shared-modules/actions/tempAccount';
import { changeAccountName } from 'iota-wallet-shared-modules/actions/account';
import { updateAccountNameInKeychain } from '../utils/keychain';
import CustomTextInput from '../components/CustomTextInput';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';

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
    saveText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
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
        flex: 9,
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
});

export class EditAccountName extends Component {
    static propTypes = {
        selectedAccountName: PropTypes.string.isRequired,
        accountInfo: PropTypes.object.isRequired,
        seedIndex: PropTypes.number.isRequired,
        accountNames: PropTypes.array.isRequired,
        password: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
        setSetting: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        changeAccountName: PropTypes.func.isRequired,
        textColor: PropTypes.object.isRequired,
        bodyColor: PropTypes.string.isRequired,
        theme: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            accountName: props.selectedAccountName,
        };
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
                    this.props.generateAlert('success', t('nicknameChanged'), t('nicknameChangedExplanation'));
                })
                .catch((err) => console.log(err)); // eslint-disable-line no-console
        }
    }

    render() {
        const { t, textColor, bodyColor, theme } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.2 }} />
                        <View style={styles.textFieldContainer}>
                            <CustomTextInput
                                label={t('accountName')}
                                onChangeText={(accountName) => this.setState({ accountName })}
                                containerStyle={{ width: width / 1.2 }}
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
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.accountNames),
    accountInfo: state.account.accountInfo,
    seedIndex: state.tempAccount.seedIndex,
    accountNames: state.account.accountNames,
    password: state.tempAccount.password,
    textColor: { color: state.settings.theme.body.color },
    bodyColor: state.settings.theme.body.color,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
    changeAccountName,
};

export default translate(['addAdditionalSeed', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(EditAccountName),
);
