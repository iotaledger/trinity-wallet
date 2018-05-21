import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';
import balloonsImagePath from 'iota-wallet-shared-modules/images/balloons.png';
import { connect } from 'react-redux';
import WithBackPressCloseApp from '../components/BackPressCloseApp';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons';
import DynamicStatusBar from '../components/DynamicStatusBar';

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
    nextButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    nextText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
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
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

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
        const { t, theme: { body, positive } } = this.props;
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
                    <TouchableOpacity onPress={() => this.onNextPress()}>
                        <View style={[styles.nextButton, { borderColor: positive.color }]}>
                            <Text style={[styles.nextText, { color: positive.color }]}>{t('global:next')}</Text>
                        </View>
                    </TouchableOpacity>
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
