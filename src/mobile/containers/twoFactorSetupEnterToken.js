import React, { Component } from 'react';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { set2FAStatus } from 'iota-wallet-shared-modules/actions/account';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, BackHandler } from 'react-native';
import { translate } from 'react-i18next';
import { Navigation } from 'react-native-navigation';
import DynamicStatusBar from '../components/dynamicStatusBar';
import CustomTextInput from '../components/customTextInput';
import Fonts from '../theme/Fonts';
import { getTwoFactorAuthKeyFromKeychain } from '../util/keychain';
import OnboardingButtons from '../components/onboardingButtons';
import StatefulDropdownAlert from './statefulDropdownAlert';
import { width, height } from '../util/dimensions';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
        width,
    },
    midWrapper: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bottomWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    subHeaderText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
        marginBottom: height / 8,
    },
});

class TwoFactorSetupEnterToken extends Component {
    static propTypes = {
        negative: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        generateAlert: PropTypes.func.isRequired,
        set2FAStatus: PropTypes.func.isRequired,
        navigator: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.goBack = this.goBack.bind(this);
        this.check2FA = this.check2FA.bind(this);

        this.state = {
            code: '',
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.goBack();
            return true;
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress');
    }

    goBack() {
        const { body } = this.props;
        this.props.navigator.pop({
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    navigateToHome() {
        const { body } = this.props;
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
        });
    }

    check2FA() {
        const { t } = this.props;
        getTwoFactorAuthKeyFromKeychain()
            .then((key) => {
                const verified = authenticator.verifyToken(key, this.state.code);

                if (verified) {
                    this.props.set2FAStatus(true);
                    this.navigateToHome();

                    this.timeout = setTimeout(() => {
                        this.props.generateAlert('success', t('twoFAEnabled'), t('twoFAEnabledExplanation'));
                    }, 300);
                } else {
                    this.props.generateAlert('error', t('wrongCode'), t('wrongCodeExplanation'));
                }
            })
            .catch((err) => console.error(err)); // generate an alert.
    }

    render() {
        const { negative, body, t } = this.props;
        const backgroundColor = { backgroundColor: body.bg };
        const textColor = { color: body.color };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.container, backgroundColor]}>
                    <DynamicStatusBar textColor={body.color} backgroundColor={body.bg} />
                    <View style={styles.topWrapper}>
                        <Icon name="iota" size={width / 8} color={body.color} />
                    </View>
                    <View style={styles.midWrapper}>
                        <View style={{ flex: 0.25 }} />
                        <Text style={[styles.subHeaderText, textColor]}>{t('enterCode')}</Text>
                        <CustomTextInput
                            label={t('code')}
                            onChangeText={(code) => this.setState({ code })}
                            containerStyle={{ width: width / 1.2 }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            onSubmitEditing={this.check2FA}
                            secondaryBackgroundColor={body.color}
                            negativeColor={negative.color}
                        />
                    </View>
                    <View style={styles.bottomWrapper}>
                        <OnboardingButtons
                            onLeftButtonPress={this.goBack}
                            onRightButtonPress={this.check2FA}
                            leftText={t('global:back')}
                            rightText={t('global:done')}
                        />
                    </View>
                    <StatefulDropdownAlert textColor={body.color} backgroundColor={body.bg} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}
const mapDispatchToProps = {
    set2FAStatus,
    generateAlert,
};

const mapStateToProps = (state) => ({
    positive: state.settings.theme.positive,
    negative: state.settings.theme.negative,
    body: state.settings.theme.body,
});

export default translate(['twoFA', 'global'])(connect(mapStateToProps, mapDispatchToProps)(TwoFactorSetupEnterToken));
