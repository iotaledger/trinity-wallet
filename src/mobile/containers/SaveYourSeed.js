import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import { StyleSheet, View, Text, BackHandler } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Button from '../components/Button';
import OnboardingButtons from '../containers/OnboardingButtons';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import DynamicStatusBar from '../components/DynamicStatusBar';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import Header from '../components/Header';

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
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    optionButtonText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    optionButton: {
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 1.36,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize4,
        backgroundColor: 'transparent',
        paddingHorizontal: width / 9,
        textAlign: 'center',
    },
    infoTextNormal: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    infoTextSmall: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    line: {
        borderLeftWidth: 0.5,
        width: 1,
        height: height / 40,
        marginVertical: height / 150,
    },
});

/** Save Your Seed component */
class SaveYourSeed extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Determines whether onboarding steps for wallet setup are completed */
        onboardingComplete: PropTypes.bool.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
    };

    componentDidMount() {
        if (this.props.onboardingComplete) {
            BackHandler.addEventListener('saveYourSeedBackPress', () => {
                this.onBackPress();
                return true;
            });
        }
    }

    componentWillUnmount() {
        if (this.props.onboardingComplete) {
            BackHandler.removeEventListener('saveYourSeedBackPress');
        }
    }

    onDonePress() {
        const { theme: { body } } = this.props;
        this.props.navigator.push({
            screen: 'saveSeedConfirmation',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    onBackPress() {
        const { theme: { body } } = this.props;
        this.props.navigator.pop({
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    onWriteClick() {
        const { theme: { body } } = this.props;
        this.props.navigator.push({
            screen: 'writeSeedDown',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    onPrintClick() {
        const { theme: { body } } = this.props;
        this.props.navigator.push({
            screen: 'paperWallet',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    onCopyClick() {
        const { theme: { body } } = this.props;
        this.props.navigator.push({
            screen: 'copySeedToClipboard',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    render() {
        const { t, theme: { body, extra } } = this.props;
        const textColor = { color: body.color };
        const lineColor = { borderLeftColor: body.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                    <View style={{ flex: 0.7 }} />
                    <Header textColor={body.color}>{t('saveYourSeed')}</Header>
                </View>
                <View style={styles.midContainer}>
                    <Trans i18nKey="saveYourSeed:mustSaveYourSeed">
                        <Text style={[styles.infoText, textColor]}>
                            <Text style={styles.infoTextNormal}>You must save your seed with </Text>
                            <Text style={styles.infoTextBold}>at least one</Text>
                            <Text style={styles.infoTextNormal}> of the options listed below.</Text>
                        </Text>
                    </Trans>
                    <View style={{ flex: 0.5 }} />
                    <Text style={[styles.infoTextSmall, textColor]}>{t('mostSecure')}</Text>
                    <View style={[styles.line, lineColor]} />
                    <View>
                        <Button
                            onPress={() => this.onWriteClick()}
                            style={{
                                wrapper: {
                                    width: width / 1.36,
                                    height: height / 13,
                                    borderRadius: height / 90,
                                    backgroundColor: extra.color,
                                },
                            }}
                        >
                            {t('global:manualCopy')}
                        </Button>
                    </View>
                    <View style={[styles.line, lineColor]} />
                    <Button
                        onPress={() => this.onCopyClick()}
                        style={{
                            wrapper: {
                                width: width / 1.36,
                                height: height / 13,
                                borderRadius: height / 90,
                                backgroundColor: extra.color,
                            },
                        }}
                    >
                        {t('global:addToPasswordManager')}
                    </Button>
                    <View style={[styles.line, lineColor]} />
                    <Button
                        onPress={() => this.onPrintClick()}
                        style={{
                            wrapper: {
                                width: width / 1.36,
                                height: height / 13,
                                borderRadius: height / 90,
                                backgroundColor: extra.color,
                            },
                        }}
                    >
                        {t('global:paperWallet')}
                    </Button>
                    <View style={[styles.line, lineColor]} />
                    <Text style={[styles.infoTextSmall, textColor]}>{t('leastSecure')}</Text>
                    <View style={{ flex: 1 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onBackPress()}
                        onRightButtonPress={() => this.onDonePress()}
                        leftButtonText={t('global:goBack')}
                        rightButtonText={t('iHavesavedMySeed')}
                    />
                </View>
                <StatefulDropdownAlert backgroundColor={body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    onboardingComplete: state.accounts.onboardingComplete,
});

export default translate(['saveYourSeed', 'global'])(connect(mapStateToProps, null)(SaveYourSeed));
