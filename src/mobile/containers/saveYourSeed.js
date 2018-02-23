import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image, BackHandler } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import glowIotaImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import OnboardingButtons from '../components/onboardingButtons';
import StatefulDropdownAlert from './statefulDropdownAlert';
import { setCopiedToClipboard } from '../../shared/actions/tempAccount';
import DynamicStatusBar from '../components/dynamicStatusBar';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

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
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: height / 20,
    },
    optionButtonText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 25.3,
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
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        textAlign: 'left',
        paddingTop: height / 10,
        backgroundColor: 'transparent',
        paddingHorizontal: width / 9,
    },
    infoTextNormal: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
});

class SaveYourSeed extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        setCopiedToClipboard: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        extraColor: PropTypes.string.isRequired,
        onboardingComplete: PropTypes.bool.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
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

    componentWillReceiveProps(newProps) {
        const { t } = this.props;
        if (newProps.tempAccount.copiedToClipboard) {
            this.timeout = setTimeout(() => {
                this.props.generateAlert('info', t('seedCleared'), t('seedClearedExplanation'));
            }, 250);
            this.props.setCopiedToClipboard(false);
        }
    }

    componentWillUnmount() {
        if (this.props.onboardingComplete) {
            BackHandler.removeEventListener('saveYourSeedBackPress');
        }
    }

    onDonePress() {
        this.props.navigator.push({
            screen: 'saveSeedConfirmation',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: this.props.backgroundColor,
                drawUnderStatusBar: true,
                statusBarColor: this.props.backgroundColor,
            },
            animated: false,
        });
    }

    onBackPress() {
        this.props.navigator.pop({
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: this.props.backgroundColor,
                drawUnderStatusBar: true,
                statusBarColor: this.props.backgroundColor,
            },
            animated: false,
        });
    }

    onWriteClick() {
        this.props.navigator.push({
            screen: 'writeSeedDown',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: this.props.backgroundColor,
                drawUnderStatusBar: true,
                statusBarColor: this.props.backgroundColor,
            },
            animated: false,
        });
    }
    onPrintClick() {
        this.props.navigator.push({
            screen: 'paperWallet',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: this.props.backgroundColor,
                drawUnderStatusBar: true,
                statusBarColor: this.props.backgroundColor,
            },
            animated: false,
        });
    }
    onCopyClick() {
        this.props.navigator.push({
            screen: 'copySeedToClipboard',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: this.props.backgroundColor,
                drawUnderStatusBar: true,
                statusBarColor: this.props.backgroundColor,
            },
            animated: false,
        });
    }

    render() {
        const { t, backgroundColor, extraColor, secondaryBackgroundColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const extraColorText = { color: extraColor };
        const extraColorBorder = { borderColor: extraColor };
        const iotaImagePath = secondaryBackgroundColor === 'white' ? glowIotaImagePath : blackIotaImagePath;

        return (
            <View style={[styles.container, { backgroundColor }]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} backgroundColor={backgroundColor} />
                <View style={styles.topContainer}>
                    <Image source={iotaImagePath} style={styles.iotaLogo} />
                    <Trans i18nKey="saveYourSeed:mustSaveYourSeed">
                        <Text style={[styles.infoText, textColor]}>
                            <Text style={styles.infoTextNormal}>You must save your seed with </Text>
                            <Text style={styles.infoTextBold}>at least one</Text>
                            <Text style={styles.infoTextNormal}> of the options listed below.</Text>
                        </Text>
                    </Trans>
                </View>
                <View style={styles.midContainer}>
                    <View style={{ paddingTop: height / 20 }}>
                        <TouchableOpacity onPress={() => this.onWriteClick()}>
                            <View style={[styles.optionButton, extraColorBorder]}>
                                <Text style={[styles.optionButtonText, extraColorText]}>
                                    {t('global:manualCopy').toUpperCase()}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingTop: height / 25 }}>
                        <TouchableOpacity onPress={() => this.onPrintClick()}>
                            <View style={[styles.optionButton, extraColorBorder]}>
                                <Text style={[styles.optionButtonText, extraColorText]}>
                                    {t('global:paperWallet').toUpperCase()}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingTop: height / 25 }}>
                        <TouchableOpacity onPress={() => this.onCopyClick()}>
                            <View style={[styles.optionButton, extraColorBorder]}>
                                <Text style={[styles.optionButtonText, extraColorText]}>
                                    {t('global:copyToClipboard').toUpperCase()}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onBackPress()}
                        onRightButtonPress={() => this.onDonePress()}
                        leftText={t('global:back')}
                        rightText={t('global:done')}
                    />
                </View>
                <StatefulDropdownAlert textColor={secondaryBackgroundColor} backgroundColor={backgroundColor} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    tempAccount: state.tempAccount,
    backgroundColor: state.settings.theme.backgroundColor,
    extraColor: state.settings.theme.extraColor,
    onboardingComplete: state.account.onboardingComplete,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

const mapDispatchToProps = {
    setCopiedToClipboard,
    generateAlert,
};

export default translate(['saveYourSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SaveYourSeed));
