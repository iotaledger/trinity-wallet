import { translate, Trans } from 'react-i18next';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import WithBackPressGoToHome from '../components/withBackPressGoToHome';
import { width, height } from '../util/dimensions';
import Fonts from '../theme/Fonts';
import OnboardingButtons from '../components/onboardingButtons';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { Icon } from '../theme/icons.js';

import InfoBox from '../components/infoBox';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midWrapper: {
        flex: 2.1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomWrapper: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    subHeaderWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width / 10,
    },
    subHeaderText: {
        fontSize: width / 22.7,
        fontFamily: 'Lato-Regular',
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoText: {
        fontSize: width / 27.6,
        fontFamily: 'Lato-Light',
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: Fonts.tertiary,
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    confirmationText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

class WalletResetConfirmation extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
        negative: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.goBack = this.goBack.bind(this);
        this.requirePassword = this.requirePassword.bind(this);
    }

    navigateTo(url) {
        const { body } = this.props;
        this.props.navigator.push({
            screen: url,
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    goBack() {
        const { body } = this.props;
        // FIXME: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
        });
    }

    requirePassword() {
        this.navigateTo('walletResetRequirePassword');
    }

    render() {
        const { t, body, negative } = this.props;
        const textColor = { color: body.color };
        const backgroundColor = { backgroundColor: body.bg };
        const negativeColor = { color: negative.color };

        return (
            <View style={[styles.container, backgroundColor]}>
                <DynamicStatusBar textColor={body.color} backgroundColor={body.bg} />
                <View style={styles.topWrapper}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                </View>
                <View style={styles.midWrapper}>
                    <View style={{ flex: 0.2 }} />
                    <InfoBox
                        text={
                            <Trans i18nKey="walletResetConfirmation:warning">
                                <Text style={[styles.infoText, textColor]}>
                                    <Text style={styles.infoTextLight}>All of your wallet data including your </Text>
                                    <Text style={styles.infoTextRegular}>seeds, password,</Text>
                                    <Text style={styles.infoTextLight}> and </Text>
                                    <Text style={styles.infoTextRegular}>other account information</Text>
                                    <Text style={styles.infoTextLight}> will be lost.</Text>
                                </Text>
                            </Trans>
                        }
                        secondaryBackgroundColor={body.colorlor}
                    />
                    <View style={{ flex: 0.4 }} />
                    <Text style={[styles.subHeaderText, negativeColor]}>{t('walletResetConfirmation:cannotUndo')}</Text>
                    <View style={{ flex: 0.2 }} />
                    <Text style={[styles.confirmationText, textColor]}>{t('global:continue?')}</Text>
                </View>
                <View style={styles.bottomWrapper}>
                    <OnboardingButtons
                        onLeftButtonPress={this.goBack}
                        onRightButtonPress={this.requirePassword}
                        leftText={t('global:no')}
                        rightText={t('global:yes')}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    positive: state.settings.theme.positive,
    negative: state.settings.theme.negative,
    body: state.settings.theme.body,
});

export default WithBackPressGoToHome()(
    translate(['walletResetConfirmation', 'global'])(connect(mapStateToProps)(WalletResetConfirmation)),
);
