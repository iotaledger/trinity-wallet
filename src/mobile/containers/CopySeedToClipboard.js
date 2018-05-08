import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Clipboard, Share, Image } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import timer from 'react-native-timer';
import RNSecureClipboard from 'react-native-secure-clipboard';
import whiteCheckboxCheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-checked-white.png';
import whiteCheckboxUncheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-unchecked-white.png';
import blackCheckboxCheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-checked-black.png';
import blackCheckboxUncheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-unchecked-black.png';
import tinycolor from 'tinycolor2';
import Modal from 'react-native-modal';
import OnboardingButtons from '../containers/OnboardingButtons';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import Seedbox from '../components/SeedBox';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import CtaButton from '../components/CtaButton';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { Icon } from '../theme/icons.js';
import InfoBox from '../components/InfoBox';
import { isAndroid } from '../utils/device';

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
        fontFamily: 'SourceSansPro-Light',
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
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 27.6,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 27.6,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: width / 27.6,
        textAlign: 'left',
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
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    modalCheckboxContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: height / 14,
    },
    modalCheckboxText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 25.9,
    },
    modalCheckbox: {
        width: width / 20,
        height: width / 20,
    },
});

/** Copy To Clipboard component */
class CopySeedToClipboard extends Component {
    static propTypes = {
        /** Seed value */
        seed: PropTypes.string.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
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
        theme: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.timeout = null;
        this.state = {
            copiedToClipboard: false,
            isModalActive: false,
        };
    }

    componentWillUnmount() {
        timer.clearTimeout('clipboardClear');
        timer.clearTimeout('delayShare');
        this.clearClipboard();
    }

    /**
     * Clear the clipboard after pressing Done
     */
    onDonePress() {
        const { theme } = this.props;
        const { copiedToClipboard } = this.state;
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
        if (copiedToClipboard) {
            this.clearClipboard();
        }
    }

    onCopyPress() {
        const { checkbox } = this.state;
        if (checkbox) {
            this.hideModal();
            this.copy();
        }
    }

    getCheckbox() {
        const { theme: { body } } = this.props;
        const { checkbox } = this.state;
        const isBgDark = tinycolor(body.bg).isDark();
        if (checkbox) {
            return isBgDark ? whiteCheckboxCheckedImagePath : blackCheckboxCheckedImagePath;
        }
        return isBgDark ? whiteCheckboxUncheckedImagePath : blackCheckboxUncheckedImagePath;
    }

    openModal() {
        this.setState({ isModalActive: true });
    }

    hideModal() {
        this.setState({ isModalActive: false, checkbox: false });
    }

    /**
     * Alert the user that the clipboard was cleared
     */
    clearClipboard() {
        const { t } = this.props;
        Clipboard.setString(' ');
        this.props.generateAlert('info', t('seedCleared'), t('seedClearedExplanation'));
    }

    /**
     * Copy the seed to the clipboard and remove it after 30 seconds
     */
    copy() {
        const { t, seed } = this.props;
        this.setState({ copiedToClipboard: true });
        if (isAndroid) {
            timer.setTimeout(
                'delayShare',
                () =>
                    Share.share(
                        {
                            message: seed,
                        },
                        {
                            dialogTitle: t('shareSeed'),
                        },
                    ),
                500,
            );
        } else {
            RNSecureClipboard.setString(seed);
            this.props.generateAlert('success', t('seedCopied'), t('seedCopiedExplanation'));
        }
        timer.setTimeout(
            'clipboardClear',
            () => {
                this.clearClipboard();
                this.setState({ copiedToClipboard: false });
            },
            60000,
        );
    }

    renderModalContent = () => {
        const { t, theme: { body } } = this.props;
        const { checkbox } = this.state;
        const textColor = { color: body.color };
        const opacity = checkbox ? 1 : 0.1;

        return (
            <View style={{ backgroundColor: body.bg, marginTop: height / 20 }}>
                <InfoBox
                    body={body}
                    width={width / 1.1}
                    text={
                        <View>
                            <Text style={[styles.infoText, textColor, { paddingTop: height / 40 }]}>
                                <Text style={styles.infoTextNormal}>{t('global:masterKey')} </Text>
                                <Text style={styles.infoTextNormal}>{t('storeEncrypted')} </Text>
                            </Text>
                            <Text style={[styles.infoTextBold, textColor, { paddingVertical: height / 30 }]}>
                                {t('tapConfirm')}
                            </Text>
                            <TouchableOpacity
                                style={[styles.modalCheckboxContainer, { paddingTop: height / 60 }]}
                                onPress={() => this.setState({ checkbox: !checkbox })}
                            >
                                <Text style={[styles.modalCheckboxText, textColor]}>{t('encryptionCheckbox')}</Text>
                                <Image source={this.getCheckbox()} style={styles.modalCheckbox} />
                            </TouchableOpacity>
                            <View style={{ paddingTop: height / 18 }}>
                                <OnboardingButtons
                                    onLeftButtonPress={() => this.hideModal()}
                                    onRightButtonPress={() => this.onCopyPress()}
                                    leftText={t('global:back')}
                                    rightText={t('copy')}
                                    opacity={opacity}
                                    containerWidth={{ width: width / 1.25 }}
                                    buttonWidth={{ width: width / 2.85 }}
                                />
                            </View>
                        </View>
                    }
                />
            </View>
        );
    };

    render() {
        const { t, theme, seed } = this.props;
        const { isModalActive } = this.state;
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
                            this.openModal();
                        }}
                        ctaWidth={width / 1.65}
                    />
                    <View style={{ flex: 0.5 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.onDonePress()}>
                        <View style={[styles.doneButton, { borderColor: theme.secondary.color }]}>
                            <Text style={[styles.doneText, { color: theme.secondary.color }]}>{t('global:done')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <Modal
                    backdropTransitionInTiming={isAndroid ? 500 : 300}
                    backdropTransitionOutTiming={200}
                    backdropColor={theme.body.bg}
                    backdropOpacity={0.8}
                    style={{ alignItems: 'center', margin: 0 }}
                    isVisible={isModalActive}
                    onBackButtonPress={() => this.hideModal()}
                    hideModalContentWhileAnimating
                    useNativeDriver={isAndroid ? true : false}
                >
                    {this.renderModalContent()}
                </Modal>
                <StatefulDropdownAlert backgroundColor={theme.body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    generateAlert,
};

export default translate(['copyToClipboard', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(CopySeedToClipboard),
);
