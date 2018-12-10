import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, Image } from 'react-native';
import PropTypes from 'prop-types';
import { navigator } from 'libs/navigation';
import balloonsImagePath from 'shared-modules/images/balloons.png';
import { connect } from 'react-redux';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoTextContainer: {
        paddingHorizontal: width / 8,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: height / 6,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
        lineHeight: height / 30,
    },
    party: {
        justifyContent: 'center',
        width,
        height: width,
        position: 'absolute',
        top: height / 5,
    },
});

/** Onboarding Complete screen componenet */
class OnboardingComplete extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('OnboardingComplete');
    }

    onNextPress() {
        const { theme: { body } } = this.props;
        navigator.setStackRoot('loading', {
            animations: {
                setStackRoot: {
                    enable: false,
                },
            },
            layout: {
                backgroundColor: body.bg,
                orientation: ['portrait'],
            },
            topBar: {
                visible: false,
                drawBehind: false,
                elevation: 0,
            },
            statusBar: {
                drawBehind: false,
                backgroundColor: body.bg,
            },
        });
    }

    render() {
        const { t, theme: { body, primary } } = this.props;
        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={400}>
                        <Icon name="iota" size={width / 8} color={body.color} />
                    </AnimatedComponent>
                </View>
                <View style={styles.midContainer}>
                    <AnimatedComponent
                        animationInType={['fadeIn']}
                        animationOutType={['fadeOut']}
                        delay={200}
                        style={styles.infoTextContainer}
                    >
                        <Text style={[styles.infoText, { color: body.color }]}>{t('walletReady')}</Text>
                    </AnimatedComponent>
                    <AnimatedComponent
                        animationInType={['fadeIn']}
                        animationOutType={['fadeOut']}
                        delay={0}
                        style={{ height, width }}
                    >
                        <Image source={balloonsImagePath} style={styles.party} />
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                        <SingleFooterButton
                            onButtonPress={() => this.onNextPress()}
                            testID="languageSetup-next"
                            buttonStyle={{
                                wrapper: { backgroundColor: primary.color },
                                children: { color: primary.body },
                            }}
                            buttonText={t('openYourWallet')}
                        />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default withNamespaces(['onboardingComplete', 'global'])(connect(mapStateToProps)(OnboardingComplete));
