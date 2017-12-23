import isEmpty from 'lodash/isEmpty';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image } from 'react-native';
import { connect } from 'react-redux';
import { increaseSeedCount, addAccountName, setOnboardingComplete } from 'iota-wallet-shared-modules/actions/account';
import { clearTempData, clearSeed } from 'iota-wallet-shared-modules/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { TextField } from 'react-native-material-textfield';
import { Keyboard } from 'react-native';
import keychain, { hasDuplicateSeed, hasDuplicateAccountName, storeSeedInKeychain } from '../util/keychain';
import OnboardingButtons from '../components/onboardingButtons.js';
import StatefulDropdownAlert from './statefulDropdownAlert';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { isAndroid } from '../util/device';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';

import infoImagePath from 'iota-wallet-shared-modules/images/info.png';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import { width, height } from '../util/dimensions';
const MIN_PASSWORD_LENGTH = 12;

class SetPassword extends Component {
    static propTypes = {
        setOnboardingComplete: PropTypes.func.isRequired,
        clearTempData: PropTypes.func.isRequired,
        clearSeed: PropTypes.func.isRequired,
        increaseSeedCount: PropTypes.func.isRequired,
        addAccountName: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            password: '',
            reentry: '',
        };
    }

    onDonePress() {
        const { t } = this.props;
        if (this.state.password.length >= MIN_PASSWORD_LENGTH && this.state.password === this.state.reentry) {
            keychain
                .get()
                .then(credentials => {
                    if (isEmpty(credentials)) {
                        return ifNoKeychainDuplicates(
                            this.state.password,
                            this.props.tempAccount.seed,
                            this.props.tempAccount.seedName,
                        );
                    } else {
                        if (hasDuplicateAccountName(credentials.data, this.props.tempAccount.seedName)) {
                            return this.props.generateAlert(
                                'error',
                                t('addAdditionalSeed:nameInUse'),
                                t('addAdditionalSeed:nameInUseExplanation'),
                            );
                        } else if (hasDuplicateSeed(credentials.data, this.props.tempAccount.seed)) {
                            return this.props.generateAlert(
                                'error',
                                t('addAdditionalSeed:seedInUse'),
                                t('addAdditionalSeed:seedInUseExplanation'),
                            );
                        }

                        return ifNoKeychainDuplicates(
                            this.state.password,
                            this.props.tempAccount.seed,
                            this.props.tempAccount.seedName,
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

            ifNoKeychainDuplicates = (password, seed, accountName) => {
                storeSeedInKeychain(password, seed, accountName)
                    .then(() => {
                        this.props.addAccountName(accountName);
                        this.props.increaseSeedCount();
                        this.props.clearTempData();
                        this.props.clearSeed();
                        this.props.setOnboardingComplete(true);
                        this.props.navigator.push({
                            screen: 'onboardingComplete',
                            navigatorStyle: {
                                navBarHidden: true,
                                navBarTransparent: true,
                            },
                            animated: false,
                            overrideBackPress: true,
                        });
                    })
                    .catch(err => console.log(err));
            };
        } else {
            if (this.state.password.length < MIN_PASSWORD_LENGTH || this.state.reentry.length < MIN_PASSWORD_LENGTH) {
                this.props.generateAlert(
                    'error',
                    t('passwordTooShort'),
                    t('passwordTooShortExplanation', {
                        minLength: MIN_PASSWORD_LENGTH,
                        currentLength: this.state.password.length,
                    }),
                );
            } else if (!(this.state.password === this.state.reentry)) {
                this.props.generateAlert('error', t('passwordMismatch'), t('passwordMismatchExplanation'));
            }
        }
    }

    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    _renderContent() {
        const { t } = this.props;
        let { password, reentry } = this.state;

        return (
            <View>
                <TouchableWithoutFeedback style={{ flex: 1, width: width }} onPress={Keyboard.dismiss}>
                    <View style={styles.container}>
                        <View style={styles.topContainer}>
                            <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                            <View style={styles.titleContainer}>
                                <Text style={styles.greetingText}>{t('nowWeNeedTo')}</Text>
                            </View>
                        </View>
                        <View style={styles.midContainer}>
                            <View style={{ flex: 0.3 }} />
                            <View style={styles.infoTextWrapper}>
                                <View style={styles.infoTextContainer}>
                                    <Image source={infoImagePath} style={styles.infoIcon} />
                                    <Text style={styles.infoText}>{t('anEncryptedCopy')}</Text>
                                    <Text style={styles.warningText}>{t('ensure')}</Text>
                                </View>
                            </View>
                            <View style={styles.textfieldsContainer}>
                                <TextField
                                    style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                    labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                    labelFontSize={width / 31.8}
                                    fontSize={width / 20.7}
                                    labelPadding={3}
                                    baseColor="white"
                                    label={t('global:password')}
                                    tintColor="#F7D002"
                                    autoCapitalize={'none'}
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically={true}
                                    returnKeyType="next"
                                    value={password}
                                    onChangeText={password => this.setState({ password })}
                                    onSubmitEditing={() => this.reentry.focus()}
                                    containerStyle={{
                                        width: width / 1.36,
                                    }}
                                    secureTextEntry={true}
                                />
                                <TextField
                                    ref={c => {
                                        this.reentry = c;
                                    }}
                                    style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                    labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                    labelFontSize={width / 31.8}
                                    fontSize={width / 20.7}
                                    labelPadding={3}
                                    baseColor="white"
                                    label={t('retypePassword')}
                                    tintColor="#F7D002"
                                    autoCapitalize={'none'}
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically={true}
                                    returnKeyType="done"
                                    value={reentry}
                                    onChangeText={reentry => this.setState({ reentry })}
                                    containerStyle={{ width: width / 1.36 }}
                                    secureTextEntry={true}
                                    onSubmitEditing={() => this.onDonePress()}
                                />
                            </View>
                            <View style={{ flex: 0.2 }} />
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
            </View>
        );
    }

    render() {
        const { t } = this.props;

        return (
            <View style={styles.container}>
                {isAndroid && <View style={styles.container}>{this._renderContent()}</View>}
                {!isAndroid && (
                    <KeyboardAwareScrollView
                        resetScrollToCoords={{ x: 0, y: 0 }}
                        contentContainerStyle={styles.container}
                        scrollEnabled={false}
                        enableOnAndroid={false}
                    >
                        {this._renderContent()}
                    </KeyboardAwareScrollView>
                )}
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
        backgroundColor: COLORS.backgroundGreen,
    },
    topContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4.8,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    textfieldsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    bottomContainer: {
        flex: 0.3,
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
        width: width / 1.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 30,
        borderStyle: 'dotted',
        paddingVertical: height / 35,
        marginTop: height / 25,
    },
    infoTextWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
});

const mapDispatchToProps = dispatch => ({
    setOnboardingComplete,
    clearTempData,
    clearSeed,
    increaseSeedCount,
    addAccountName,
    generateAlert,
});

export default translate(['setPassword', 'global', 'addAdditionalSeed'])(
    connect(mapStateToProps, mapDispatchToProps)(SetPassword),
);
