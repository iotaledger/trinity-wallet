import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image, StatusBar, BackHandler } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import OnboardingButtons from '../components/onboardingButtons';
import StatefulDropdownAlert from './statefulDropdownAlert';
import { setCopiedToClipboard } from '../../shared/actions/tempAccount';
import { Navigation } from 'react-native-navigation';
import THEMES from '../theme/themes';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

class SaveYourSeed extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        setCopiedToClipboard: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        backgroundColor: PropTypes.object.isRequired,
        extraColor: PropTypes.object.isRequired,
        onboardingComplete: PropTypes.bool.isRequired,
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

    componentWillReceiveProps(newProps) {
        const { t } = this.props;
        if (newProps.tempAccount.copiedToClipboard) {
            this.timeout = setTimeout(() => {
                this.props.generateAlert('info', t('seedCleared'), t('seedClearedExplanation'));
            }, 500);
            this.props.setCopiedToClipboard(false);
        }
    }
    onDonePress() {
        this.props.navigator.push({
            screen: 'saveSeedConfirmation',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
            },
            animated: false,
        });
    }

    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    onWriteClick() {
        this.props.navigator.push({
            screen: 'writeSeedDown',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
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
                screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
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
                screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
            },
            animated: false,
        });
    }

    render() {
        const { t, backgroundColor, extraColor } = this.props;
        const extraColorText = { color: THEMES.getHSL(extraColor) };
        const extraColorBorder = { borderColor: THEMES.getHSL(extraColor) };

        return (
            <View style={[styles.container, { backgroundColor: THEMES.getHSL(backgroundColor) }]}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                    <Text style={styles.infoText}>
                        <Text style={styles.infoTextNormal}>{t('mustSaveYourSeed')}</Text>
                        <Text style={styles.infoTextBold}>{t('atLeastOne')}</Text>
                        <Text style={styles.infoTextNormal}>{t('ofTheOptions')}</Text>
                    </Text>
                </View>
                <View style={styles.midContainer}>
                    <View style={{ paddingTop: height / 20 }}>
                        <TouchableOpacity onPress={event => this.onWriteClick()}>
                            <View style={[styles.optionButton, extraColorBorder]}>
                                <Text style={[styles.optionButtonText, extraColorText]}>
                                    {t('global:manualCopy').toUpperCase()}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingTop: height / 25 }}>
                        <TouchableOpacity onPress={event => this.onPrintClick()}>
                            <View style={[styles.optionButton, extraColorBorder]}>
                                <Text style={[styles.optionButtonText, extraColorText]}>
                                    {t('global:paperWallet').toUpperCase()}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingTop: height / 25 }}>
                        <TouchableOpacity onPress={event => this.onCopyClick()}>
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
                <StatefulDropdownAlert />
            </View>
        );
    }
}

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
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 35,
        paddingBottom: height / 30,
    },
    title: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        textAlign: 'left',
        paddingTop: height / 10,
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: width / 9,
    },
    infoTextNormal: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    dropdownTitle: {
        fontSize: width / 25.9,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        paddingLeft: width / 20,
        paddingRight: width / 15,
        paddingVertical: height / 30,
    },
    dropdownMessage: {
        fontSize: width / 29.6,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        paddingTop: height / 60,
    },
    dropdownImage: {
        marginLeft: width / 25,
        width: width / 12,
        height: width / 12,
        alignSelf: 'center',
    },
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    backgroundColor: state.settings.theme.backgroundColor,
    extraColor: state.settings.theme.extraColor,
    onboardingComplete: state.account.onboardingComplete,
});

const mapDispatchToProps = {
    setCopiedToClipboard,
    generateAlert,
};

export default translate(['saveYourSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SaveYourSeed));
