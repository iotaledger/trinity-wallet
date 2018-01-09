import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image } from 'react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { connect } from 'react-redux';
import { TextField } from 'react-native-material-textfield';
import { Keyboard } from 'react-native';
import StatefulDropdownAlert from './statefulDropdownAlert';
import OnboardingButtons from '../components/onboardingButtons';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { setSeedName, setAdditionalAccountInfo } from '../../shared/actions/tempAccount';
import { width, height } from '../util/dimensions';
import keychain, { hasDuplicateAccountName, hasDuplicateSeed } from '../util/keychain';
import THEMES from '../theme/themes';
import GENERAL from '../theme/general';

import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import infoImagePath from 'iota-wallet-shared-modules/images/info-white.png';

export class SetSeedName extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        setSeedName: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        setAdditionalAccountInfo: PropTypes.func.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            accountName: this.getDefaultAccountName(),
        };
    }

    componentDidMount() {
        if (this.nameInput) {
            this.nameInput.focus();
        }
    }

    navigateTo(screen) {
        if (screen === 'loading') {
            return this.props.navigator.push({
                screen,
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
                animated: false,
                overrideBackPress: true,
            });
        } else {
            return this.props.navigator.push({
                screen,
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
                animated: false,
            });
        }
    }

    onDonePress() {
        const { t } = this.props;
        const trimmedAccountName = trim(this.state.accountName);

        const fetch = accountName => {
            this.props.setAdditionalAccountInfo({
                addingAdditionalAccount: true,
                additionalAccountName: accountName,
            });

            this.navigateTo('loading');
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
                            return fetch(trimmedAccountName);
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

                            return fetch(trimmedAccountName);
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

    render() {
        const { accountName } = this.state;
        const { t, backgroundColor, negativeColor, secondaryBackgroundColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const borderColor = { borderColor: secondaryBackgroundColor };

        return (
            <View style={[styles.container, { backgroundColor: THEMES.getHSL(backgroundColor) }]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topContainer}>
                            <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                            <View style={styles.titleContainer}>
                                <Text style={[styles.greetingText, textColor]}>
                                    {t('addAdditionalSeed:enterAccountName')}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.midContainer}>
                            <TextField
                                style={{ color: secondaryBackgroundColor, fontFamily: 'Lato-Light' }}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={width / 31.8}
                                fontSize={width / 20.7}
                                labelPadding={3}
                                baseColor={secondaryBackgroundColor}
                                label={t('addAdditionalSeed:accountName')}
                                tintColor={THEMES.getHSL(negativeColor)}
                                autoCapitalize="words"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically={true}
                                returnKeyType="done"
                                value={accountName}
                                onChangeText={accountName => this.setState({ accountName })}
                                containerStyle={{
                                    width: width / 1.4,
                                }}
                                ref={input => {
                                    this.nameInput = input;
                                }}
                                onSubmitEditing={() => this.onDonePress()}
                            />
                            <View style={[styles.infoTextContainer, borderColor]}>
                                <Image source={infoImagePath} style={styles.infoIcon} />
                                <Text style={[styles.infoText, textColor]}>{t('canUseMultipleSeeds')}</Text>
                                <Text style={[styles.infoText, textColor]}>{t('youCanAdd')}</Text>
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
        width,
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
    infoTextContainer: {
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
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    greetingText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
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
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    account: state.account,
    backgroundColor: state.settings.theme.backgroundColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

const mapDispatchToProps = {
    setSeedName,
    generateAlert,
    setAdditionalAccountInfo,
};

export default translate(['setSeedName', 'global', 'addAdditionalSeed'])(
    connect(mapStateToProps, mapDispatchToProps)(SetSeedName),
);
