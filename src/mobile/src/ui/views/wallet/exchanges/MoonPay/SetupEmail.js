import React from 'react';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import navigator from 'libs/navigation';
import { getThemeFromState } from 'shared-modules/selectors/global';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { authenticateViaEmail } from 'shared-modules/actions/exchanges/MoonPay';
import WithUserActivity from 'ui/components/UserActivity';
import CustomTextInput from 'ui/components/CustomTextInput';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';

console.ignoredYellowBox = ['Native TextInput']; // eslint-disable-line no-console

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
    seedVaultImportContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
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

    render() {
        const { t, theme, isAuthenticatingEmail } = this.props;

        return (
            <TouchableWithoutFeedback style={{ flex: 0.8 }} onPress={Keyboard.dismiss} accessible={false}>
                <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                    <View>
                        <View style={styles.topContainer}>
                            <AnimatedComponent
                                animationInType={['slideInRight', 'fadeIn']}
                                animationOutType={['slideOutLeft', 'fadeOut']}
                                delay={400}
                            >
                                <Header textColor={theme.body.color} />
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
                                    testID="enterSeed-seedbox"
                                />
                            </AnimatedComponent>
                            <View style={{ flex: 0.6 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                                <DualFooterButtons
                                    onLeftButtonPress={() => SetupEmail.redirectToScreen('selectAccount')}
                                    onRightButtonPress={() => this.props.authenticateViaEmail(this.state.email)}
                                    isRightButtonLoading={isAuthenticatingEmail}
                                    leftButtonText={t('global:goBack')}
                                    rightButtonText={t('global:continue')}
                                    leftButtonTestID="enterSeed-back"
                                    rightButtonTestID="enterSeed-next"
                                />
                            </AnimatedComponent>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
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
};

export default WithUserActivity()(
    withTranslation()(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(SetupEmail),
    ),
);
