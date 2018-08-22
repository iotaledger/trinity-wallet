import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, Image } from 'react-native';
import PropTypes from 'prop-types';
import balloonsImagePath from 'shared/images/balloons.png';
import { connect } from 'react-redux';
import WithBackPressCloseApp from 'mobile/src/ui/components/BackPressCloseApp';
import GENERAL from 'mobile/src/ui/theme/general';
import { width, height } from 'mobile/src/libs/dimensions';
import { Icon } from 'mobile/src/ui/theme/icons';
import DynamicStatusBar from 'mobile/src/ui/components/DynamicStatusBar';
import Button from 'mobile/src/ui/components/Button';
import { leaveNavigationBreadcrumb } from 'mobile/src/libs/bugsnag';

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
        fontSize: GENERAL.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
        lineHeight: height / 30,
    },
    party: {
        justifyContent: 'center',
        width,
        height: width,
        position: 'absolute',
        top: -height / 10,
    },
});

/** Onboarding Complete screen componenet */
class OnboardingComplete extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('OnboardingComplete');
    }

    onNextPress() {
        const { theme: { body } } = this.props;
        this.props.navigator.push({
            screen: 'loading',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    render() {
        const { t, theme: { body, primary } } = this.props;
        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoText, { color: body.color }]}>{t('walletReady')}</Text>
                    </View>
                    <Image source={balloonsImagePath} style={styles.party} />
                </View>
                <View style={styles.bottomContainer}>
                    <Button
                        onPress={() => this.onNextPress()}
                        testID="languageSetup-next"
                        style={{
                            wrapper: { backgroundColor: primary.color },
                            children: { color: primary.body },
                        }}
                    >
                        {t('openYourWallet')}
                    </Button>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default WithBackPressCloseApp()(
    translate(['onboardingComplete', 'global'])(connect(mapStateToProps)(OnboardingComplete)),
);
