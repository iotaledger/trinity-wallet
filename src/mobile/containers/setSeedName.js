import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { TextField } from 'react-native-material-textfield';
import { Keyboard } from 'react-native';
import StatefulDropdownAlert from './statefulDropdownAlert';
import OnboardingButtons from '../components/onboardingButtons.js';
import {
    fetchFullAccountInfoForFirstUse,
    getFullAccountInfo,
    setFirstUse,
    increaseSeedCount,
    addAccountName,
} from '../../shared/actions/account';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { clearTempData, setSeedName, clearSeed, setReady } from '../../shared/actions/tempAccount';
import { width, height } from '../util/dimensions';
import keychain, { storeSeedInKeychain, hasDuplicateAccountName, hasDuplicateSeed } from '../util/keychain';
import THEMES from '../theme/themes';
import GENERAL from '../theme/general';

import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import infoImagePath from 'iota-wallet-shared-modules/images/info.png';

export class SetSeedName extends Component {
    static propTypes = {
        increaseSeedCount: PropTypes.func.isRequired,
        setSeedName: PropTypes.func.isRequired,
        clearSeed: PropTypes.func.isRequired,
        setReady: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        setFirstUse: PropTypes.func.isRequired,
        clearTempData: PropTypes.func.isRequired,
        addAccountName: PropTypes.func.isRequired,
        getFullAccountInfo: PropTypes.func.isRequired,
        fetchFullAccountInfoForFirstUse: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            accountName: this.getDefaultAccountName(),
        };
    }

    getDefaultAccountName() {
        const { t } = this.props;
        if (this.props.account.seedCount === 0) {
            return t('global:mainWallet');
        } else if (this.props.account.seedCount === 1) {
            return t('global:secondWallet');
        } else if (this.props.account.seedCount === 2) {
            return t('global:thirdWallet');
        } else if (this.props.account.seedCount === 3) {
            return t('global:fourthWallet');
        } else if (this.props.account.seedCount === 4) {
            return t('global:fifthWallet');
        } else if (this.props.account.seedCount === 5) {
            return t('global:sixthWallet');
        } else if (this.props.account.seedCount === 6) {
            return t('global:otherWallet');
        } else {
            return '';
        }
    }

    componentDidMount() {
        if (this.nameInput) {
            this.nameInput.focus();
        }
    }

    navigateTo(screen) {
        return this.props.navigator.push({
            screen,
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    onDonePress() {
        const { t } = this.props;
        const trimmedAccountName = trim(this.state.accountName);

        const fetch = (seed, accountName, password, promise, navigator) => {
            this.navigateTo('loading');

            this.props.fetchFullAccountInfoForFirstUse(seed, accountName, password, promise, navigator);
        };

        if (!isEmpty(this.state.accountName)) {
            if (!this.props.account.onboardingComplete) {
                this.props.setSeedName(trimmedAccountName);

                this.navigateTo('setPassword');
            } else {
                keychain
                    .get()
                    .then(credentials => {
                        if (isEmpty(credentials)) {
                            return fetch(
                                this.props.tempAccount.seed,
                                trimmedAccountName,
                                this.props.tempAccount.password,
                                storeSeedInKeychain,
                                this.props.navigator,
                            );
                        } else {
                            if (hasDuplicateAccountName(credentials.password, trimmedAccountName)) {
                                return this.props.generateAlert(
                                    'error',
                                    t('addAdditionalSeed:nameInUse'),
                                    t('addAdditionalSeed:nameInUseExplanation'),
                                );
                            } else if (hasDuplicateSeed(credentials.password, this.props.tempAccount.seed)) {
                                return this.props.generateAlert(
                                    'error',
                                    t('addAdditionalSeed:seedInUse'),
                                    t('addAdditionalSeed:seedInUseExplanation'),
                                );
                            }

                            return fetch(
                                this.props.tempAccount.seed,
                                trimmedAccountName,
                                this.props.tempAccount.password,
                                storeSeedInKeychain,
                                this.props.navigator,
                            );
                        }
                    })
                    .catch(() => {
                        this.props.generateAlert(
                            'error',
                            t('global:somethingWentWrong'),
                            t('global:somethingWentWrongExplanation'),
                        );
                    });
            }
        } else {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:noNickname'),
                t('addAdditionalSeed:noNicknameExplanation'),
            );
        }
    }

    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    render() {
        let { accountName } = this.state;
        const { t, backgroundColor, negativeColor } = this.props;
        return (
            <View style={[styles.container, { backgroundColor: THEMES.getHSL(backgroundColor) }]}>
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topContainer}>
                            <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                            <View style={styles.titleContainer}>
                                <Text style={styles.greetingText}>{t('addAdditionalSeed:enterAccountName')}</Text>
                            </View>
                        </View>
                        <View style={styles.midContainer}>
                            <TextField
                                style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={width / 31.8}
                                fontSize={width / 20.7}
                                labelPadding={3}
                                baseColor="white"
                                label={t('addAdditionalSeed:accountName')}
                                tintColor={THEMES.getHSL(negativeColor)}
                                autoCapitalize="words"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically={true}
                                returnKeyType="done"
                                value={accountName}
                                onChangeText={accountName => this.setState({ accountName })}
                                containerStyle={{
                                    width: width / 1.36,
                                }}
                                ref={input => {
                                    this.nameInput = input;
                                }}
                                onSubmitEditing={() => this.onDonePress()}
                            />
                            <View style={styles.infoTextContainer}>
                                <Image source={infoImagePath} style={styles.infoIcon} />
                                <Text style={styles.infoText}>{t('canUseMultipleSeeds')}</Text>
                                <Text style={styles.infoText}>{t('youCanAdd')}</Text>
                            </View>
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={() => this.onBackPress()}
                                onRightButtonPress={() => this.onDonePress()}
                                leftText={t('global:back')}
                                rightText={t('global:done')}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <StatefulDropdownAlert />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4.8,
        justifyContent: 'flex-start',
        paddingTop: height / 8,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 15,
    },
    title: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextContainer: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 1.6,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width / 30,
        borderStyle: 'dotted',
        paddingVertical: height / 35,
        marginTop: height / 15,
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    warningText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 70,
        backgroundColor: 'transparent',
    },
    greetingText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    questionText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        paddingHorizontal: width / 7,
        paddingTop: height / 25,
        backgroundColor: 'transparent',
    },
    infoIcon: {
        width: width / 20,
        height: width / 20,
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    dropdownTitle: {
        fontSize: width / 25.9,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        paddingLeft: width / 20,
        paddingRight: width / 15,
        paddingVertical: height / 30,
    },
    dropdownMessage: {
        fontSize: width / 29.6,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        paddingTop: height / 60,
    },
    dropdownImage: {
        marginLeft: width / 25,
        width: width / 12,
        height: width / 12,
        alignSelf: 'center',
    },
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    account: state.account,
    backgroundColor: state.settings.theme.backgroundColor,
    negativeColor: state.settings.theme.negativeColor,
});

const mapDispatchToProps = {
    increaseSeedCount,
    setSeedName,
    clearSeed,
    setReady,
    generateAlert,
    setFirstUse,
    clearTempData,
    addAccountName,
    getFullAccountInfo,
    fetchFullAccountInfoForFirstUse,
};

export default translate(['setSeedName', 'global', 'addAdditionalSeed'])(
    connect(mapStateToProps, mapDispatchToProps)(SetSeedName),
);
