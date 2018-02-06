import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image } from 'react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { connect } from 'react-redux';
import CustomTextInput from '../components/customTextInput';
import { Keyboard } from 'react-native';
import StatefulDropdownAlert from './statefulDropdownAlert';
import OnboardingButtons from '../components/onboardingButtons';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { setSeedName, setAdditionalAccountInfo } from 'iota-wallet-shared-modules/actions/tempAccount';
import { width, height } from '../util/dimensions';
import keychain, { hasDuplicateAccountName, hasDuplicateSeed } from '../util/keychain';
import glowIotaImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import InfoBox from '../components/infoBox';

console.ignoredYellowBox = true;

export class SetSeedName extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        setSeedName: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        setAdditionalAccountInfo: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            accountName: this.getDefaultAccountName(),
        };
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
                        console.log('Credentials', credentials);
                        if (isEmpty(credentials)) {
                            return fetch(trimmedAccountName);
                        } else {
                            if (hasDuplicateAccountName(credentials.data, trimmedAccountName)) {
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
        if (screen === 'loading') {
            return this.props.navigator.push({
                screen,
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: this.props.backgroundColor,
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
                    screenBackgroundColor: this.props.backgroundColor,
                },
                animated: false,
            });
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
        const iotaImagePath = secondaryBackgroundColor === 'white' ? glowIotaImagePath : blackIotaImagePath;

        return (
            <View style={[styles.container, { backgroundColor: backgroundColor }]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View>
                        <View style={styles.topContainer}>
                            <Image source={iotaImagePath} style={styles.iotaLogo} />
                        </View>
                        <View style={styles.midContainer}>
                            <View style={{ flex: 0.5 }} />
                            <CustomTextInput
                                label={t('addAdditionalSeed:accountName')}
                                onChangeText={accountName => this.setState({ accountName })}
                                containerStyle={{ width: width / 1.36 }}
                                autoCapitalize={'words'}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                onSubmitEditing={() => this.onDonePress()}
                                secondaryBackgroundColor={secondaryBackgroundColor}
                                negativeColor={negativeColor}
                                value={accountName}
                            />
                            <View style={{ flex: 0.3 }} />
                            <InfoBox
                                secondaryBackgroundColor={secondaryBackgroundColor}
                                text={
                                    <View>
                                        <Text style={[styles.infoText, textColor]}>{t('canUseMultipleSeeds')}</Text>
                                        <Text style={[styles.infoText, textColor]}>{t('youCanAdd')}</Text>
                                    </View>
                                }
                            />
                            <View style={{ flex: 0.5 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={() => this.onBackPress()}
                                onRightButtonPress={() => this.onDonePress()}
                                leftText={t('global:back')}
                                rightText={t('global:done')}
                                leftButtonTestID="setSeedName-back"
                                rightButtonTestID="setSeedName-done"
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
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4.8,
        justifyContent: 'space-around',
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
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'justify',
        paddingTop: height / 60,
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
