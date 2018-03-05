import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Clipboard, Share } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import StatefulDropdownAlert from './statefulDropdownAlert';
import Seedbox from '../components/seedBox';
import { width, height } from '../util/dimensions';
import { isAndroid } from '../util/device';
import { setCopiedToClipboard } from '../../shared/actions/tempAccount';
import GENERAL from '../theme/general';
import CtaButton from '../components/ctaButton';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { Icon } from '../theme/icons.js';

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
});

class CopySeedToClipboard extends Component {
    static propTypes = {
        seed: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        setCopiedToClipboard: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        secondary: PropTypes.object.isRequired,
        positive: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
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
        const { body } = this.props;
        this.clearTimeout();
        Clipboard.setString(' ');
        this.props.setCopiedToClipboard(true);

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
        const { t, positive, body, secondary, primary, seed } = this.props;
        const textColor = { color: body.color };
        const borderColor = { borderColor: body.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                </View>
                <View style={styles.midContainer}>
                    <Text style={[styles.infoTextNormal, textColor]}>{t('clickToCopy')}</Text>
                    <Text style={[styles.infoTextBold, textColor]}>{t('doNotStore')}</Text>
                    <Seedbox backgroundColor={body.bg} borderColor={borderColor} textColor={textColor} seed={seed} />
                    <View style={{ flex: 0.2 }} />
                    <CtaButton
                        ctaColor={primary.color}
                        ctaBorderColor={primary.hover}
                        secondaryCtaColor={secondary.color}
                        text={t('copyToClipboard').toUpperCase()}
                        onPress={() => {
                            this.onCopyPress();
                        }}
                        ctaWidth={width / 1.65}
                    />
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.onDonePress()}>
                        <View style={[styles.doneButton, { borderColor: positive.color }]}>
                            <Text style={[styles.doneText, { color: positive.color }]}>{t('global:done')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <StatefulDropdownAlert backgroundColor={body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.tempAccount.seed,
    backgroundColor: state.settings.theme.backgroundColor,
    positive: state.settings.theme.positive,
    negative: state.settings.theme.negative,
    primary: state.settings.theme.primary,
    secondary: state.settings.theme.secondary,
    body: state.settings.theme.body,
    ctaBorderColor: state.settings.theme.ctaBorderColor,
});

const mapDispatchToProps = {
    setCopiedToClipboard,
    generateAlert,
};

export default translate(['copyToClipboard', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(CopySeedToClipboard),
);
