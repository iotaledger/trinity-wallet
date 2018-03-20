import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';
import balloonsImagePath from 'iota-wallet-shared-modules/images/balloons.png';
import { connect } from 'react-redux';
import WithBackPressCloseApp from '../components/withBackPressCloseApp';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';
import { Icon } from '../theme/icons.js';
import DynamicStatusBar from '../components/dynamicStatusBar';

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
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
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
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
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

class OnboardingComplete extends Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        navigator: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        positive: PropTypes.object.isRequired,
    };

    onNextPress() {
        const { body } = this.props;
        this.props.navigator.push({
            screen: 'loading',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    render() {
        const { t, body, positive } = this.props;
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
    body: state.settings.theme.body,
    positive: state.settings.theme.positive,
});

export default WithBackPressCloseApp()(
    translate(['onboardingComplete', 'global'])(connect(mapStateToProps, null)(OnboardingComplete)),
);
