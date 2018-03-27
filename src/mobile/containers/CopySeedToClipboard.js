import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Clipboard, Share } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { setCopiedToClipboard } from 'iota-wallet-shared-modules/actions/wallet';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import Seedbox from '../components/SeedBox';
import { width, height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';
import GENERAL from '../theme/general';
import CtaButton from '../components/CtaButton';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { Icon } from '../theme/icons.js';
import InfoBox from '../components/InfoBox';

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
        paddingTop: height / 16,
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
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'center',
        backgroundColor: 'transparent',
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
});

/** Copy To Clipboard component */
class CopySeedToClipboard extends Component {
    static propTypes = {
        /** Seed value */
        seed: PropTypes.string.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Set a flag for clipboard copy
         * @param {boolean} - true
         */
        setCopiedToClipboard: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
        * @param {string} translationString - locale string identifier to be translated
        */
        t: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired
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
        const { theme } = this.props;
        this.clearTimeout();
        Clipboard.setString(' ');
        this.props.setCopiedToClipboard(true);

        this.props.navigator.pop({
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: theme.body.bg,
                drawUnderStatusBar: true,
                statusBarColor: theme.body.bg,
            },
            animated: false,
        });
    }

    /**
     * Copy the seed to the clipboard and remove it after 30 seconds
     */
    onCopyPress() {
        const { t, seed } = this.props;

        if (isAndroid) {
            return Share.share(
                {
                    message: seed,
                },
                {
                    dialogTitle: t('shareSeed'),
                },
            );
        }

        Clipboard.setString(seed);
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
        const { t, theme, seed } = this.props;
        const textColor = { color: theme.body.color };
        const borderColor = { borderColor: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                <DynamicStatusBar backgroundColor={theme.body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={theme.body.color} />
                </View>
                <View style={styles.midContainer}>
                    <View style={{ flex: 0.5 }} />
                    <InfoBox
                        body={theme.body}
                        text={
                            <Text>
                                <Text style={[styles.infoTextNormal, textColor]}>{t('clickToCopy')} </Text>
                                <Text style={[styles.infoTextBold, textColor]}>{t('doNotStore')}</Text>
                            </Text>
                        }
                    />
                    <View style={{ flex: 0.2 }} />
                    <Seedbox bodyColor={theme.body.color} borderColor={borderColor} textColor={textColor} seed={seed} />
                    <View style={{ flex: 0.2 }} />
                    <CtaButton
                        ctaColor={theme.primary.color}
                        ctaBorderColor={theme.primary.hover}
                        secondaryCtaColor={theme.primary.body}
                        text={t('copyToClipboard').toUpperCase()}
                        onPress={() => {
                            this.onCopyPress();
                        }}
                        ctaWidth={width / 1.65}
                    />
                    <View style={{ flex: 0.5 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.onDonePress()}>
                        <View style={[styles.doneButton, { borderColor: theme.primary.color }]}>
                            <Text style={[styles.doneText, { color: theme.primary.color }]}>{t('global:done')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <StatefulDropdownAlert backgroundColor={theme.body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: state.settings.theme
});

const mapDispatchToProps = {
    setCopiedToClipboard,
    generateAlert,
};

export default translate(['copyToClipboard', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(CopySeedToClipboard),
);
