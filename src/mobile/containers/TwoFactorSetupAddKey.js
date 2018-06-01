import React, { Component } from 'react';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import QRCode from 'react-native-qrcode-svg';
import { Clipboard, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { translate } from 'react-i18next';
import WithBackPressGoToHome from '../components/BackPressGoToHome';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { storeTwoFactorAuthKeyInKeychain } from '../utils/keychain';
import Fonts from '../theme/fonts';
import OnboardingButtons from '../containers/OnboardingButtons';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
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
        paddingTop: height / 16,
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
    },
    subHeaderText: {
        fontFamily: Fonts.secondary,
        fontSize: GENERAL.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
        marginBottom: height / 15,
    },
    infoText: {
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: Fonts.tertiary,
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    qrContainer: {
        backgroundColor: 'white',
        borderRadius: GENERAL.borderRadiusLarge,
        padding: width / 30,
        marginBottom: height / 25,
    },
});

/** Two factor authentication setup component */
export class TwoFactorSetupAddKey extends Component {
    static propTypes = {
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Generate a notification alert
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Wallet's password hash */
        password: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.goBack = this.goBack.bind(this);
        this.navigateToEnterToken = this.navigateToEnterToken.bind(this);

        this.state = {
            authKey: authenticator.generateKey(),
        };
    }

    onKeyPress(key) {
        const { t } = this.props;
        if (key) {
            Clipboard.setString(key.replace(/\s/g, ''));
            this.props.generateAlert('success', t('keyCopied'), t('keyCopiedExplanation'));
        }
    }

    goBack() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    navigateToEnterToken() {
        Clipboard.setString(' ');
        const { t, theme: { body }, password } = this.props;

        return storeTwoFactorAuthKeyInKeychain(password, this.state.authKey)
            .then(() => {
                this.props.navigator.push({
                    screen: 'twoFactorSetupEnterToken',
                    navigatorStyle: {
                        navBarHidden: true,
                        topBarElevationShadowEnabled: false,
                        screenBackgroundColor: body.bg,
                        drawUnderStatusBar: true,
                        statusBarColor: body.bg,
                        tabBarHidden: true,
                        drawUnderTabBar: true,
                    },
                    animated: false,
                    appStyle: {
                        orientation: 'portrait',
                    },
                });
            })
            .catch(() =>
                this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongTryAgain'),
                ),
            );
    }

    render() {
        const { theme: { body }, t } = this.props;
        const backgroundColor = { backgroundColor: body.bg };
        const textColor = { color: body.color };

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topWrapper}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                </View>
                <View style={styles.midWrapper}>
                    <View style={{ flex: 0.4 }} />
                    <Text style={[styles.subHeaderText, textColor]}>{t('addKey')}</Text>
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={authenticator.generateTotpUri(this.state.authKey, 'Trinity Wallet Mobile')}
                            size={height / 5}
                            bgColor="#000"
                            fgColor="#FFF"
                        />
                    </View>
                    <TouchableOpacity onPress={() => this.onKeyPress(this.state.authKey)}>
                        <Text style={[styles.infoText, textColor]}>
                            <Text style={styles.infoText}>{t('key')}</Text>
                            <Text style={styles.infoText}>: </Text>
                            <Text style={styles.infoTextLight}>{this.state.authKey}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomWrapper}>
                    <OnboardingButtons
                        onLeftButtonPress={this.goBack}
                        onRightButtonPress={this.navigateToEnterToken}
                        leftButtonText={t('global:goBack')}
                        rightButtonText={t('global:nextLowerCase')}
                    />
                </View>
                <StatefulDropdownAlert textColor={body.color} backgroundColor={body.bg} />
            </View>
        );
    }
}
const mapDispatchToProps = {
    generateAlert,
};

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    password: state.wallet.password,
});

export default WithBackPressGoToHome()(
    translate(['twoFA', 'global'])(connect(mapStateToProps, mapDispatchToProps)(TwoFactorSetupAddKey)),
);
