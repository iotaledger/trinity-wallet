import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { navigator } from 'libs/navigation';
import { connect } from 'react-redux';
import LottieView from 'lottie-react-native';
import welcomeAnimation from 'shared-modules/animations/welcome.json';
import { generateAlert } from 'shared-modules/actions/alerts';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import { getThemeFromState } from 'shared-modules/selectors/global';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import { width } from 'libs/dimensions';
import Header from 'ui/components/Header';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 2.6,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    animation: {
        width: width / 1.35,
        height: width / 1.35,
    }
});

/** Welcome screen component */
class Welcome extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        acceptedPrivacy: PropTypes.bool.isRequired,
        /** @ignore */
        acceptedTerms: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('Welcome');
    }

    /**
     * Navigates to the next screen
     * @method onNextPress
     */
    onNextPress() {
        navigator.push(this.getNextRoute());
    }

    /**
     * Returns next navigation route
     * @method getNextRoute
     * @returns {function}
     */
    getNextRoute() {
        const { acceptedTerms, acceptedPrivacy } = this.props;
        let nextRoute = 'walletSetup';
        if (!acceptedTerms && !acceptedPrivacy) {
            nextRoute = 'termsAndConditions';
        } else if (acceptedTerms && !acceptedPrivacy) {
            nextRoute = 'privacyPolicy';
        }
        return nextRoute;
    }

    render() {
        const { t, theme: { body } } = this.props;

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topContainer}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={400}
                    >
                        <Header textColor={body.color}>{t('welcome')}</Header>
                    </AnimatedComponent>
                </View>
                <View style={styles.midContainer}>
                    <AnimatedComponent
                        animationInType={['fadeIn','slideInRight']}
                        animationOutType={['fadeOut', 'slideOutLeft']}
                        delay={200}
                        style={styles.animation}
                    >
                        <LottieView
                            ref={(animation) => {
                                this.animation = animation;
                            }}
                            source={welcomeAnimation}
                            style={styles.animation}
                            loop
                            autoPlay
                        />
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn','slideInRight']} animationOutType={['fadeOut','slideOutLeft']} delay={0}>
                        <SingleFooterButton
                            onButtonPress={() => this.onNextPress()}
                            testID="languageSetup-next"
                            buttonText={t('continue')}
                        />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    acceptedPrivacy: state.settings.acceptedPrivacy,
    acceptedTerms: state.settings.acceptedTerms,
});

const mapDispatchToProps = {
    generateAlert,
    toggleModalActivity,
};

export default withNamespaces(['welcome', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Welcome));
