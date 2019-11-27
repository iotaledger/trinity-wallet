import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { getAnimation } from 'shared-modules/animations';
import { connect } from 'react-redux';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { setLoggingIn } from 'shared-modules/actions/exchanges/MoonPay';
import { Styling } from 'ui/theme/general';
import { height, width } from 'libs/dimensions';
import navigator from 'libs/navigation';
import CtaButton from 'ui/components/CtaButton';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3.8,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    animation: {
        width: width / 1.85,
        height: width / 1.85,
    },
    text: {
        fontFamily: 'SourceSansPro-Light',
        textAlign: 'center',
        width: Styling.contentWidth * 0.8,
        fontSize: Styling.fontSize5,
        alignItems: 'center',
    },
});

/** Require login view screen partial for history screen */
class RequireLoginView extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        setLoggingIn: PropTypes.func.isRequired,
    };

    render() {
        const { t, theme, themeName, setLoggingIn } = this.props;

        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <Text style={[styles.text, { color: theme.body.color }]}>
                        {t('moonpay:loginToViewPurchaseHistory')}
                    </Text>
                </View>
                <View style={styles.midContainer}>
                    <LottieView
                        source={getAnimation('welcome', themeName)}
                        style={styles.animation}
                        loop={false}
                        autoPlay
                        ref={(ref) => {
                            this.animation = ref;
                        }}
                        onAnimationFinish={() => this.animation.play(161, 395)}
                    />
                </View>
                <View style={{ flex: 0.3 }} />
                <View style={styles.bottomContainer}>
                    <CtaButton
                        ctaColor={theme.primary.color}
                        ctaBorderColor={theme.primary.color}
                        secondaryCtaColor={theme.primary.body}
                        text={t('moonpay:openMoonPay')}
                        onPress={() => {
                            setLoggingIn(true);
                            navigator.push('landing');
                        }}
                        ctaWidth={width / 1.4}
                        ctaHeight={height / 12}
                        displayActivityIndicator={false}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    forceUpdate: state.wallet.forceUpdate,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    setSetting,
    setLoggingIn
};

export default withTranslation(['languageSetup', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(RequireLoginView),
);
