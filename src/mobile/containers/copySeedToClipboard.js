import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image, Clipboard } from 'react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import glowIotaImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import StatefulDropdownAlert from './statefulDropdownAlert';
import Seedbox from '../components/seedBox';
import COLORS from '../theme/Colors';
import { width, height } from '../util/dimensions';
import { setCopiedToClipboard } from '../../shared/actions/tempAccount';
import GENERAL from '../theme/general';
import THEMES from '../theme/themes';

class CopySeedToClipboard extends Component {
    static propTypes = {
        tempAccount: PropTypes.object.isRequired,
        navigator: PropTypes.object.isRequired,
        setCopiedToClipboard: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        secondaryCtaColor: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.timeout = null;
    }

    componentWillUnmount() {
        this.clearTimeout();
        Clipboard.setString(' ');
    }

    onDonePress() {
        this.clearTimeout();
        Clipboard.setString(' ');
        this.props.setCopiedToClipboard(true);

        this.props.navigator.pop({
            animated: false,
        });
    }

    onCopyPress() {
        const { t } = this.props;

        Clipboard.setString(this.props.tempAccount.seed);

        this.props.generateAlert('success', t('seedCopied'), t('seedCopiedExplanation'));

        this.timeout = setTimeout(() => {
            Clipboard.setString(' ');
            this.generateClipboardClearAlert();
        }, 30000);
    }

    generateClipboardClearAlert() {
        const { t } = this.props;

        return this.props.generateAlert('info', t('seedCleared'), t('seedClearedExplanation'));
    }

    clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    render() {
        const {
            t,
            positiveColor,
            backgroundColor,
            ctaColor,
            secondaryBackgroundColor,
            secondaryCtaColor,
            ctaBorderColor,
        } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const borderColor = { borderColor: secondaryBackgroundColor };
        const ctaTextColor = { color: secondaryCtaColor };
        const iotaImagePath = secondaryBackgroundColor === 'white' ? glowIotaImagePath : blackIotaImagePath;

        return (
            <View style={[styles.container, { backgroundColor: THEMES.getHSL(backgroundColor) }]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                <View style={styles.topContainer}>
                    <Image source={iotaImagePath} style={styles.iotaLogo} />
                </View>
                <View style={styles.midContainer}>
                    <Text style={[styles.infoTextNormal, textColor]}>{t('clickToCopy')}</Text>
                    <Text style={[styles.infoTextBold, textColor]}>{t('doNotStore')}</Text>
                    <Seedbox
                        secondaryBackgroundColor={secondaryBackgroundColor}
                        borderColor={borderColor}
                        textColor={textColor}
                        seed={this.props.tempAccount.seed}
                    />
                    <TouchableOpacity onPress={event => this.onCopyPress()} style={{ marginTop: height / 22 }}>
                        <View
                            style={[
                                styles.copyButton,
                                { backgroundColor: THEMES.getHSL(ctaColor), borderColor: ctaBorderColor },
                            ]}
                        >
                            <Text style={[styles.copyText, ctaTextColor]}>{t('copyToClipboard').toUpperCase()}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={event => this.onDonePress()}>
                        <View style={[styles.doneButton, { borderColor: THEMES.getHSL(positiveColor) }]}>
                            <Text style={[styles.doneText, { color: THEMES.getHSL(positiveColor) }]}>
                                {t('global:done')}
                            </Text>
                        </View>
                    </TouchableOpacity>
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
        flex: 0.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
        paddingHorizontal: width / 20,
    },
    midContainer: {
        flex: 4.6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    optionButtonText: {
        color: '#8BD4FF',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        textAlign: 'center',
        paddingHorizontal: width / 20,
        backgroundColor: 'transparent',
    },
    optionButton: {
        borderColor: '#8BD4FF',
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 1.6,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    infoTextNormal: {
        paddingTop: height / 12,
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: width / 5,
    },
    infoTextBold: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingTop: height / 80,
        paddingBottom: height / 40,
    },
    doneButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    doneText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    copyButton: {
        borderRadius: GENERAL.borderRadius,
        width: width / 2,
        height: height / 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.2,
    },
    copyText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 29.6,
        backgroundColor: 'transparent',
    },
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    backgroundColor: state.settings.theme.backgroundColor,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
    ctaColor: state.settings.theme.ctaColor,
    secondaryCtaColor: state.settings.theme.secondaryCtaColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
    ctaBorderColor: state.settings.theme.ctaBorderColor,
});

const mapDispatchToProps = {
    setCopiedToClipboard,
    generateAlert,
};

export default translate(['copyToClipboard', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(CopySeedToClipboard),
);
