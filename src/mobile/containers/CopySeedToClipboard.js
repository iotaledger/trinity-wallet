import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, Linking, TouchableOpacity, Clipboard, Image, NativeModules } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { setSeedShareTutorialVisitationStatus } from 'iota-wallet-shared-modules/actions/settings';
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
        fontSize: GENERAL.fontSize3,
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
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoLinkWrapper: {
        paddingTop: height / 40,
        textAlign: 'center',
    },
    infoLink: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: width / 27.6,
        textDecorationLine: 'underline',
    },
    doneButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    doneText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    modalCheckboxContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: height / 14,
        marginVertical: height / 30,
    },
    modalCheckboxText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
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
        /** Determines if a user has visited the seed share tutorial link */
        hasVisitedSeedShareTutorial: PropTypes.bool.isRequired,
        /** Sets status if a user has visited the seed share tutorial link
         * @param {boolean} status
         */
        setSeedShareTutorialVisitationStatus: PropTypes.func.isRequired,
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

    onCopyPress(isTrue) {
        if (isTrue) {
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
        if (isAndroid) {
            timer.setTimeout(
                'delayShare',
                () => {
                    NativeModules.ShareSecure.share('keepass', {
                        title: t('shareSeed'),
                        message: seed,
                    }).catch(() =>
                        this.props.generateAlert('error', t('noPasswordManagers'), t('noPasswordManagersExplanation')),
                    );
                },
                500,
            );
        } else {
            this.setState({ copiedToClipboard: true });
            RNSecureClipboard.setString(seed);
            this.props.generateAlert('success', t('seedCopied'), t('seedCopiedExplanation'));
            timer.setTimeout(
                'clipboardClear',
                () => {
                    this.clearClipboard();
                    this.setState({ copiedToClipboard: false });
                },
                60000,
            );
        }
    }

    renderInfoBoxContentForAndroid() {
        const { t, theme: { body }, hasVisitedSeedShareTutorial } = this.props;
        const textColor = { color: body.color };
        const opacity = hasVisitedSeedShareTutorial ? 1 : 0.1;

        return (
            <View>
                <Text style={[styles.infoText, textColor, { paddingTop: height / 40 }]}>
                    <Text style={styles.infoTextNormal}>{t('global:masterKey')} </Text>
                    <Text style={styles.infoTextNormal}>
                        It must be stored appropriately. However, Android does not provide a secure clipboard.
                    </Text>
                </Text>
                <Text style={[styles.infoText, textColor, { paddingTop: height / 40 }]}>
                    <Text style={styles.infoTextNormal}>
                        If you wish to store your seed in a password manager, you must follow a tutorial from the
                        following link:
                    </Text>
                </Text>
                <Text style={[styles.infoLinkWrapper, textColor]}>
                    <Text
                        style={styles.infoLink}
                        onPress={() => {
                            this.props.setSeedShareTutorialVisitationStatus(true);
                            Linking.openURL('http://google.com');
                        }}
                    >
                        https://foo.bar
                    </Text>
                </Text>
                <Text style={[styles.infoTextBold, textColor, { paddingTop: height / 40 }]}>
                    Never copy paste your seed on an Android device.{' '}
                </Text>
                <View style={{ paddingTop: height / 18 }}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.hideModal()}
                        onRightButtonPress={() => this.onCopyPress(hasVisitedSeedShareTutorial)}
                        leftText={t('global:back')}
                        rightText={t('global:proceed').toUpperCase()}
                        opacity={opacity}
                        containerWidth={{ width: width / 1.25 }}
                        buttonWidth={{ width: width / 2.85 }}
                    />
                </View>
            </View>
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
                        isAndroid ? (
                            this.renderInfoBoxContentForAndroid()
                        ) : (
                            <View>
                                <Text style={[styles.infoText, textColor, { paddingTop: height / 40 }]}>
                                    <Text style={styles.infoTextNormal}>{t('global:masterKey')} </Text>
                                    <Text style={styles.infoTextNormal}>{t('storeEncrypted')} </Text>
                                </Text>
                                <Text style={[styles.infoTextBold, textColor, { paddingTop: height / 30 }]}>
                                    {t('tapConfirm')}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.modalCheckboxContainer]}
                                    onPress={() => this.setState({ checkbox: !checkbox })}
                                >
                                    <Text style={[styles.modalCheckboxText, textColor]}>
                                        {t('passwordManagerCheckbox')}
                                    </Text>
                                    <Image source={this.getCheckbox()} style={styles.modalCheckbox} />
                                </TouchableOpacity>
                                <Text style={[styles.infoTextBold, textColor]}>{t('doNotOpen')} </Text>
                                <View style={{ paddingTop: height / 18 }}>
                                    <OnboardingButtons
                                        onLeftButtonPress={() => this.hideModal()}
                                        onRightButtonPress={() => this.onCopyPress(checkbox)}
                                        leftText={t('global:back')}
                                        rightText={t('copy')}
                                        opacity={opacity}
                                        containerWidth={{ width: width / 1.25 }}
                                        buttonWidth={{ width: width / 2.85 }}
                                    />
                                </View>
                            </View>
                        )
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
                        text={t(isAndroid ? 'global:shareSeed' : 'copyToClipboard').toUpperCase()}
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
                    useNativeDriver={!!isAndroid}
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
    hasVisitedSeedShareTutorial: state.settings.hasVisitedSeedShareTutorial,
});

const mapDispatchToProps = {
    generateAlert,
    setSeedShareTutorialVisitationStatus,
};

export default translate(['copyToClipboard', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(CopySeedToClipboard),
);
