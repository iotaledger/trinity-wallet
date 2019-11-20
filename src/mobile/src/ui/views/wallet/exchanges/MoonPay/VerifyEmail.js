import React from 'react';
import { withTranslation } from 'react-i18next';
import { Linking, Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import navigator from 'libs/navigation';
import { generateAlert } from 'shared-modules/actions/alerts';
import { verifyEmailAndFetchMeta, setLoggingIn } from 'shared-modules/actions/exchanges/MoonPay';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { MOONPAY_PRIVACY_POLICY_LINK, MOONPAY_TERMS_OF_USE_LINK } from 'shared-modules/exchanges/MoonPay';
import { getCustomerEmail } from 'shared-modules/selectors/exchanges/MoonPay';
import { MoonPayKeychainAdapter } from 'libs/keychain';
import WithUserActivity from 'ui/components/UserActivity';
import CustomTextInput from 'ui/components/CustomTextInput';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import whiteCheckboxCheckedImagePath from 'shared-modules/images/checkbox-checked-white.png';
import whiteCheckboxUncheckedImagePath from 'shared-modules/images/checkbox-unchecked-white.png';
import blackCheckboxCheckedImagePath from 'shared-modules/images/checkbox-checked-black.png';
import blackCheckboxUncheckedImagePath from 'shared-modules/images/checkbox-unchecked-black.png';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
        width,
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    checkboxContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkbox: {
        width: width / 22,
        height: width / 22,
    },
    checkboxText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize2,
        backgroundColor: 'transparent',
        marginLeft: width / 40,
    },
    checkboxTextOverride: {
        marginLeft: 0,
    },
    link: {
        textDecorationLine: 'underline',
        fontSize: Styling.fontSize2,
    },
});

/** MoonPay verify email component */
class VerifyEmail extends React.Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        email: PropTypes.string.isRequired,
        /** @ignore */
        isVerifyingEmail: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorVerifyingEmail: PropTypes.bool.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        verifyEmailAndFetchMeta: PropTypes.func.isRequired,
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        setLoggingIn: PropTypes.func.isRequired,
        /** @ignore */
        isLoggingIn: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);

        const { isDark } = props.theme;

        this.state = {
            securityCode: '',
            checkboxImage: isDark ? whiteCheckboxUncheckedImagePath : blackCheckboxUncheckedImagePath,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isVerifyingEmail && !nextProps.isVerifyingEmail && !nextProps.hasErrorVerifyingEmail) {
            if (this.props.isLoggingIn) {
                this.props.setLoggingIn(false);
                return navigator.setStackRoot('home');
            }
            this.redirectToScreen('selectAccount');
        }
    }

    /**
     * Handles checkbox press
     *
     * @method onCheckboxPress
     *
     * @returns {void}
     */
    onCheckboxPress() {
        const { isDark } = this.props.theme;

        const _set = (prevState) => {
            if (isDark) {
                return prevState.checkboxImage === whiteCheckboxCheckedImagePath
                    ? whiteCheckboxUncheckedImagePath
                    : whiteCheckboxCheckedImagePath;
            }

            return prevState.checkboxImage === blackCheckboxCheckedImagePath
                ? blackCheckboxUncheckedImagePath
                : blackCheckboxCheckedImagePath;
        };

        this.setState((prevState) => ({
            checkboxImage: _set(prevState),
        }));
    }

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    redirectToScreen(screen) {
        navigator.push(screen);
    }

    /**
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        navigator.pop(this.props.componentId);
    }

    /**
     * Verifies user email
     *
     * @method verify
     *
     * @returns {function}
     */
    verify() {
        const { t } = this.props;

        if (!this.state.securityCode) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidSecurityCode'),
                t('moonpay:pleaseEnterValidSecurityCode'),
            );
        }

        if (this.state.checkboxImage === whiteCheckboxUncheckedImagePath) {
            return this.props.generateAlert(
                'error',
                t('moonpay:notAcceptedTermsOfUse'),
                t('moonpay:pleaseAcceptMoonPayTermsOfUse'),
            );
        }

        return this.props.verifyEmailAndFetchMeta(this.state.securityCode, MoonPayKeychainAdapter);
    }

    render() {
        const { t, theme, isVerifyingEmail, email } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                <View>
                    <View style={styles.topContainer}>
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={400}
                        >
                            <Header iconSize={width / 3} iconName="moonpay" textColor={theme.body.color} />
                        </AnimatedComponent>
                    </View>
                    <View style={styles.midContainer}>
                        <View style={{ flex: 0.2 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={300}
                        >
                            <InfoBox>
                                <Text style={[styles.infoText, { color: theme.body.color }]}>
                                    {t('moonpay:checkInbox')}
                                </Text>
                                <Text
                                    style={[
                                        styles.infoTextRegular,
                                        { paddingTop: height / 60, color: theme.body.color },
                                    ]}
                                >
                                    {t('moonpay:verificationCodeSent', { email })}
                                </Text>
                            </InfoBox>
                        </AnimatedComponent>
                        <View style={{ flex: 0.3 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={200}
                        >
                            <CustomTextInput
                                keyboardType="numeric"
                                label={t('moonpay:verificationCode')}
                                onValidTextChange={(securityCode) => this.setState({ securityCode })}
                                theme={theme}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                value={this.state.securityCode}
                            />
                        </AnimatedComponent>
                        <View style={{ flex: 0.15 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={100}
                        >
                            <View style={styles.checkboxContainer}>
                                <TouchableOpacity
                                    hitSlop={{ top: 20, right: 20, left: 20, bottom: 20 }}
                                    onPress={() => this.onCheckboxPress()}
                                >
                                    <Image source={this.state.checkboxImage} style={styles.checkbox} />
                                </TouchableOpacity>
                                <View style={styles.checkboxContainer}>
                                    <Text style={[styles.checkboxText, textColor]}>
                                        {t('moonpay:agreeWithMoonPay')}{' '}
                                    </Text>
                                    <TouchableOpacity onPress={() => Linking.openURL(MOONPAY_TERMS_OF_USE_LINK)}>
                                        <Text style={[styles.infoTextBold, textColor, styles.link]}>
                                            {t('moonpay:termsOfUse')}{' '}
                                        </Text>
                                    </TouchableOpacity>
                                    <Text style={[styles.checkboxText, textColor, styles.checkboxTextOverride]}>
                                        {t('global:and')}{' '}
                                    </Text>
                                    <TouchableOpacity onPress={() => Linking.openURL(MOONPAY_PRIVACY_POLICY_LINK)}>
                                        <Text style={[styles.infoTextBold, textColor, styles.link]}>
                                            {t('privacyPolicy:privacyPolicy')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </AnimatedComponent>
                        <View style={{ flex: 0.4 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                            <DualFooterButtons
                                onLeftButtonPress={() => this.goBack()}
                                onRightButtonPress={() => this.verify()}
                                isRightButtonLoading={isVerifyingEmail}
                                disableLeftButton={isVerifyingEmail}
                                leftButtonText={t('global:goBack')}
                                rightButtonText={t('global:continue')}
                                leftButtonTestID="moonpay-back"
                                rightButtonTestID="moonpay-verify-email"
                            />
                        </AnimatedComponent>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    email: getCustomerEmail(state),
    isVerifyingEmail: state.exchanges.moonpay.isVerifyingEmail,
    hasErrorVerifyingEmail: state.exchanges.moonpay.hasErrorVerifyingEmail,
    isLoggingIn: state.exchanges.moonpay.isLoggingIn,
});

const mapDispatchToProps = {
    generateAlert,
    verifyEmailAndFetchMeta,
    setLoggingIn
};

export default WithUserActivity()(
    withTranslation()(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(VerifyEmail),
    ),
);
