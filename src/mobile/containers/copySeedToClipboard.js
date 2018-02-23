import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image, Clipboard } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import glowIotaImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import StatefulDropdownAlert from './statefulDropdownAlert';
import Seedbox from '../components/seedBox';
import { width, height } from '../util/dimensions';
import { setCopiedToClipboard } from '../../shared/actions/tempAccount';
import GENERAL from '../theme/general';
import CtaButton from '../components/ctaButton';
import DynamicStatusBar from '../components/dynamicStatusBar';

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
});

class CopySeedToClipboard extends Component {
    static propTypes = {
        tempAccount: PropTypes.object.isRequired,
        navigator: PropTypes.object.isRequired,
        setCopiedToClipboard: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        secondaryCtaColor: PropTypes.string.isRequired,
        positiveColor: PropTypes.string.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        ctaColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        ctaBorderColor: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.timeout = null;
    }

    componentWillUnmount() {
        this.clearTimeout();
        Clipboard.setString(' ');
    }

    /**
     * Clear the clipboard after pressing Done
     */
    onDonePress() {
        this.clearTimeout();
        Clipboard.setString(' ');
        this.props.setCopiedToClipboard(true);

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

    /**
     * Copy the seed to the clipboard and remove it after 30 seconds
     */
    onCopyPress() {
        const { t } = this.props;

        Clipboard.setString(this.props.tempAccount.seed);

        this.props.generateAlert('success', t('seedCopied'), t('seedCopiedExplanation'));

        this.timeout = setTimeout(() => {
            Clipboard.setString(' ');
            this.generateClipboardClearAlert();
        }, 30000);
    }

    /**
     * Alert the user that the clipboard was cleared
     */
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
        const iotaImagePath = secondaryBackgroundColor === 'white' ? glowIotaImagePath : blackIotaImagePath;

        return (
            <View style={[styles.container, { backgroundColor }]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} backgroundColor={backgroundColor} />
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
                    <View style={{ flex: 0.2 }} />
                    <CtaButton
                        ctaColor={ctaColor}
                        ctaBorderColor={ctaBorderColor}
                        secondaryCtaColor={secondaryCtaColor}
                        text={t('copyToClipboard').toUpperCase()}
                        onPress={() => {
                            this.onCopyPress();
                        }}
                        ctaWidth={width / 1.65}
                    />
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.onDonePress()}>
                        <View style={[styles.doneButton, { borderColor: positiveColor }]}>
                            <Text style={[styles.doneText, { color: positiveColor }]}>{t('global:done')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <StatefulDropdownAlert />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
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
