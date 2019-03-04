import React, { Component } from 'react';
import PropTypes from 'prop-types';
import authenticator from 'authenticator';
import { generateAlert } from 'shared-modules/actions/alerts';
import { connect } from 'react-redux';
import QRCode from 'react-native-qr-generator';
import { navigator } from 'libs/navigation';
import { Clipboard, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { storeTwoFactorAuthKeyInKeychain } from 'libs/keychain';
import Fonts from 'ui/theme/fonts';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import Header from 'ui/components/Header';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 0.9,
        alignItems: 'center',
        justifyContent: 'flex-start',
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
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
        marginBottom: height / 15,
    },
    infoText: {
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: Fonts.tertiary,
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    qrContainer: {
        backgroundColor: 'white',
        borderRadius: Styling.borderRadiusLarge,
        padding: width / 30,
        marginBottom: height / 15,
        alignItems: 'center',
    },
});

/** Two factor authentication setup component */
export class TwoFactorSetupAddKey extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
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

    componentDidMount() {
        leaveNavigationBreadcrumb('TwoFactorSetupAddKey');
    }

    componentWillUnmount() {
        delete this.state.authKey;
    }

    /**
     * Copies two factor authentication key
     *
     * @method onKeyPress
     * @param {string} key
     */
    onKeyPress(key) {
        const { t } = this.props;
        if (key) {
            Clipboard.setString(key.replace(/\s/g, ''));
            this.props.generateAlert('success', t('keyCopied'), t('keyCopiedExplanation'));
        }
    }

    /**
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        navigator.pop(this.props.componentId);
    }

    /**
     * Navigates to enter token screen
     * @method navigateToEnterToken
     */
    navigateToEnterToken() {
        Clipboard.setString(' ');
        const { t } = this.props;
        return storeTwoFactorAuthKeyInKeychain(global.passwordHash, this.state.authKey)
            .then(() => {
                navigator.push('twoFactorSetupEnterToken');
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
        const totpLink = `${'otpauth://totp/Trinity Wallet Mobile?secret='}${this.state.authKey.replace(/\W/g, '').toLowerCase()}`;

        return (
            <View style={[styles.container, backgroundColor]}>
                <View style={styles.topWrapper}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={400}
                    >
                        <Header textColor={body.color} />
                    </AnimatedComponent>
                </View>
                <View style={styles.midWrapper}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={300}
                    >
                        <Text style={[styles.subHeaderText, textColor]}>{t('addKey')}</Text>
                    </AnimatedComponent>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={200}
                    >
                        <View style={styles.qrContainer}>
                            <QRCode
                                value={totpLink}
                                size={height / 5}
                                backgroundColor="#00000000"
                            />
                        </View>
                    </AnimatedComponent>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={200}
                    >
                        <TouchableOpacity onPress={() => this.onKeyPress(this.state.authKey)}>
                            <Text style={[styles.infoText, textColor]}>
                                <Text style={styles.infoText}>{t('key')}</Text>
                                <Text style={styles.infoText}>: </Text>
                                <Text style={styles.infoTextLight}>{this.state.authKey}</Text>
                            </Text>
                        </TouchableOpacity>
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomWrapper}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                        <DualFooterButtons
                            onLeftButtonPress={this.goBack}
                            onRightButtonPress={this.navigateToEnterToken}
                            leftButtonText={t('global:goBack')}
                            rightButtonText={t('global:next')}
                        />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}
const mapDispatchToProps = {
    generateAlert,
};

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

export default withNamespaces(['twoFA', 'global'])(connect(mapStateToProps, mapDispatchToProps)(TwoFactorSetupAddKey));
