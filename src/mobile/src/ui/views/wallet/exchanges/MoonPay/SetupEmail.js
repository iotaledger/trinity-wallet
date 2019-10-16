import React from 'react';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import navigator from 'libs/navigation';
import { getThemeFromState } from 'shared-modules/selectors/global';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { authenticateViaEmail } from 'shared-modules/actions/exchanges/MoonPay';
import { generateAlert } from 'shared-modules/actions/alerts';
import { isValidEmail } from 'shared-modules/libs/utils';
import WithUserActivity from 'ui/components/UserActivity';
import CustomTextInput from 'ui/components/CustomTextInput';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';

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
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** MoonPay setup email component */
class SetupEmail extends React.Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isAuthenticatingEmail: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorAuthenticatingEmail: PropTypes.bool.isRequired,
        /** @ignore */
        authenticateViaEmail: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
    };

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    static redirectToScreen(screen) {
        navigator.push(screen);
    }

    constructor(props) {
        super(props);

        this.state = {
            email: '',
        };
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.isAuthenticatingEmail &&
            !nextProps.isAuthenticatingEmail &&
            !nextProps.hasErrorAuthenticatingEmail
        ) {
            SetupEmail.redirectToScreen('verifyEmail');
        }
    }

    /**
     * Authenticates user via emai
     *
     * @method authenticateViaEmail
     *
     * @returns {function}
     */
    authenticateViaEmail() {
        const { email } = this.state;
        const { t } = this.props;

        if (!email) {
            return this.props.generateAlert('error', t('moonpay:emptyEmail'), t('moonpay:emptyEmailExplanation'));
        } else if (!isValidEmail(email)) {
            return this.props.generateAlert('error', t('moonpay:invalidEmail'), t('moonpay:invalidEmailExplanation'));
        }

        return this.props.authenticateViaEmail(email);
    }

    render() {
        const { t, theme, isAuthenticatingEmail } = this.props;

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
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={266}
                        >
                            <InfoBox>
                                <Text style={[styles.infoText, { color: theme.body.color }]}>
                                    {t('moonpay:setupEmail')}
                                </Text>
                                <Text
                                    style={[
                                        styles.infoTextRegular,
                                        { paddingTop: height / 60, color: theme.body.color },
                                    ]}
                                >
                                    {t('moonpay:setupEmailExplanation')}
                                </Text>
                            </InfoBox>
                        </AnimatedComponent>
                        <View style={{ flex: 0.3 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={133}
                        >
                            <CustomTextInput
                                label={t('moonpay:yourEmail')}
                                onValidTextChange={(email) => this.setState({ email })}
                                theme={theme}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                autoCapitalize="none"
                                returnKeyType="done"
                                value={this.state.email}
                            />
                        </AnimatedComponent>
                        <View style={{ flex: 0.6 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                            <DualFooterButtons
                                onLeftButtonPress={() => SetupEmail.redirectToScreen('selectAccount')}
                                onRightButtonPress={() => this.authenticateViaEmail()}
                                isRightButtonLoading={isAuthenticatingEmail}
                                leftButtonText={t('global:goBack')}
                                rightButtonText={t('global:continue')}
                                leftButtonTestID="moonpay-back"
                                rightButtonTestID="moonpay-select-account"
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
    isAuthenticatingEmail: state.exchanges.moonpay.isAuthenticatingEmail,
    hasErrorAuthenticatingEmail: state.exchanges.moonpay.hasErrorAuthenticatingEmail,
});

const mapDispatchToProps = {
    authenticateViaEmail,
    generateAlert,
};

export default WithUserActivity()(
    withTranslation()(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(SetupEmail),
    ),
);
