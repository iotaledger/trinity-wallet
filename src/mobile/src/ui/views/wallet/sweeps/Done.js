import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import navigator from 'libs/navigation';
import { getAnimation } from 'shared-modules/animations';
import { getThemeFromState } from 'shared-modules/selectors/global';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import Header from 'ui/components/Header';
import InfoBox from 'ui/components/InfoBox';
import { Styling } from 'ui/theme/general';
import { height, width } from 'libs/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 0.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midWrapper: {
        flex: 2.2,
        justifyContent: 'center',
    },
    bottomWrapper: {
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontSize: Styling.fontSize3,
        fontFamily: 'SourceSansPro-Light',
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingBottom: height / 30,
    },
    animation: {
        width: width / 2,
        height: width / 2,
        alignSelf: 'center',
        paddingBottom: height / 40,
    },
});

/**
 * Sweep funds success component
 */
class Done extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    render() {
        const {
            t,
            themeName,
            theme: { body },
        } = this.props;
        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topWrapper}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={400}
                    >
                        <Header textColor={body.color}>{t('success')}</Header>
                    </AnimatedComponent>
                </View>
                <View style={styles.midWrapper}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={200}
                    >
                        <InfoBox>
                            <Text style={[styles.infoText, { color: body.color }]}>
                                {t('fundsUnlockedExplanation')}
                            </Text>
                            <LottieView
                                style={styles.animation}
                                source={getAnimation('onboardingComplete', themeName)}
                                loop={false}
                                autoPlay
                                ref={(ref) => {
                                    this.animation = ref;
                                }}
                            />
                        </InfoBox>
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomWrapper}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                        <SingleFooterButton
                            onButtonPress={() => navigator.setStackRoot('home')}
                            testID="welcome-next"
                            buttonText={t('done')}
                        />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    themeName: state.settings.themeName,
});

export default connect(mapStateToProps)(withTranslation(['sweeps', 'global'])(Done));
