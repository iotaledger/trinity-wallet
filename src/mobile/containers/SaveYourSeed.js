import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, BackHandler } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import OnboardingButtons from '../components/OnboardingButtons';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import { setCopiedToClipboard } from '../../shared/actions/tempAccount';
import DynamicStatusBar from '../components/DynamicStatusBar';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import { isIOS } from '../utils/device';
import { Icon } from '../theme/icons.js';

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
        backgroundColor: 'transparent',
        paddingHorizontal: width / 9,
        textAlign: 'center',
    },
    infoTextNormal: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    infoTextBold: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

class SaveYourSeed extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        setCopiedToClipboard: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        onboardingComplete: PropTypes.bool.isRequired,
        extra: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
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
        if (newProps.tempAccount.copiedToClipboard && isIOS) {
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
        const { body } = this.props;
        this.props.navigator.push({
            screen: 'saveSeedConfirmation',
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

    onBackPress() {
        const { body } = this.props;
        this.props.navigator.pop({
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

    onWriteClick() {
        const { body } = this.props;
        this.props.navigator.push({
            screen: 'writeSeedDown',
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
    onPrintClick() {
        const { body } = this.props;
        this.props.navigator.push({
            screen: 'paperWallet',
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
    onCopyClick() {
        const { body } = this.props;
        this.props.navigator.push({
            screen: 'copySeedToClipboard',
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

    render() {
        const { t, body, extra } = this.props;
        const textColor = { color: body.color };
        const extraColorText = { color: extra.color };
        const extraColorBorder = { borderColor: extra.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                </View>
                <View style={styles.midContainer}>
                    <View style={{ flex: 0.4 }} />
                    <Trans i18nKey="saveYourSeed:mustSaveYourSeed">
                        <Text style={[styles.infoText, textColor]}>
                            <Text style={styles.infoTextNormal}>You must save your seed with </Text>
                            <Text style={styles.infoTextBold}>at least one</Text>
                            <Text style={styles.infoTextNormal}> of the options listed below.</Text>
                        </Text>
                    </Trans>
                    <View style={{ flex: 0.5 }} />
                    <View>
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
                    <View style={{ flex: 1 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onBackPress()}
                        onRightButtonPress={() => this.onDonePress()}
                        leftText={t('global:back')}
                        rightText={t('global:done')}
                    />
                </View>
                <StatefulDropdownAlert backgroundColor={body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    tempAccount: state.tempAccount,
    body: state.settings.theme.body,
    extra: state.settings.theme.extra,
    onboardingComplete: state.account.onboardingComplete,
});

const mapDispatchToProps = {
    setCopiedToClipboard,
    generateAlert,
};

export default translate(['saveYourSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SaveYourSeed));
