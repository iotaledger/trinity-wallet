import React, { Component } from 'react';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { set2FAStatus } from 'iota-wallet-shared-modules/actions/account';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import QRCode from 'react-native-qrcode-svg';
import { Clipboard, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { translate } from 'react-i18next';
import { Navigation } from 'react-native-navigation';
import WithBackPressGoToHome from '../components/withBackPressGoToHome';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { storeTwoFactorAuthKeyInKeychain } from '../util/keychain';
import Fonts from '../theme/Fonts';
import OnboardingButtons from '../components/onboardingButtons';
import StatefulDropdownAlert from './statefulDropdownAlert';
import GENERAL from '../theme/general';
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
        marginBottom: height / 15,
    },
    infoText: {
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: Fonts.tertiary,
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    qrContainer: {
        backgroundColor: 'white',
        borderRadius: GENERAL.borderRadiusLarge,
        padding: width / 30,
        marginBottom: height / 25,
    },
});

export class TwoFactorSetupAddKey extends Component {
    static propTypes = {
        body: PropTypes.object.isRequired,
        generateAlert: PropTypes.func.isRequired,
        navigator: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
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
            Clipboard.setString(key);
            this.props.generateAlert('success', t('keyCopied'), t('keyCopiedExplanation'));
        }
    }

    goBack() {
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

    navigateToEnterToken() {
        Clipboard.setString(' ');
        const { body } = this.props;

        return storeTwoFactorAuthKeyInKeychain(this.state.authKey)
            .then(() => {
                this.props.navigator.push({
                    screen: 'twoFactorSetupEnterToken',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: body.bg,
                        drawUnderStatusBar: true,
                        statusBarColor: body.bg,
                    },
                    animated: false,
                    appStyle: {
                        orientation: 'portrait',
                        keepStyleAcrossPush: true,
                    },
                });
            })
            .catch((err) => console.error(err)); // Generate an alert.
    }

    render() {
        const { body, t } = this.props;
        const backgroundColor = { backgroundColor: body.bg };
        const textColor = { color: body.color };

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar textColor={body.color} backgroundColor={body.bg} />
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
                        leftText={t('global:back')}
                        rightText={t('global:next')}
                    />
                </View>
                <StatefulDropdownAlert textColor={body.color} backgroundColor={body.bg} />
            </View>
        );
    }
}
const mapDispatchToProps = {
    set2FAStatus,
    generateAlert,
};

const mapStateToProps = (state) => ({
    positive: state.settings.theme.positiveColor,
    negative: state.settings.theme.negativeColor,
    body: state.settings.theme.body,
});

export default WithBackPressGoToHome()(
    translate(['twoFA', 'global'])(connect(mapStateToProps, mapDispatchToProps)(TwoFactorSetupAddKey)),
);
