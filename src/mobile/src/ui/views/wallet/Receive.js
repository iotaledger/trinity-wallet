import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Clipboard,
    TouchableWithoutFeedback,
    Keyboard,
    Animated,
    Easing,
} from 'react-native';
import Share from 'react-native-share';
import { captureRef } from 'react-native-view-shot';
import { connect } from 'react-redux';
import { generateNewAddress } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import {
    selectAccountInfo,
    getSelectedAccountName,
    selectLatestAddressFromAccountFactory,
} from 'shared-modules/selectors/accounts';
import { getCurrencySymbol, getIOTAUnitMultiplier } from 'shared-modules/libs/currency';
import { getFromKeychainRequest, getFromKeychainSuccess, getFromKeychainError } from 'shared-modules/actions/keychain';
import { isValidAmount } from 'shared-modules/libs/iota/utils';
import { getThemeFromState } from 'shared-modules/selectors/global';
import timer from 'react-native-timer';
import SeedStore from 'libs/SeedStore';
import { Styling } from 'ui/theme/general';
import MultiTextInput from 'ui/components/MultiTextInput';
import CustomQrCodeComponent from 'ui/components/CustomQRCode';
import { Icon } from 'ui/theme/icons';
import ScramblingText from 'ui/components/ScramblingText';
import CtaButton from 'ui/components/CtaButton';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import InfoBox from 'ui/components/InfoBox';
import { width, height } from 'libs/dimensions';
import { isAndroid, getAndroidFileSystemPermissions } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    flipCard: {
        width: Styling.contentWidth,
        height: height / 1.5,
        borderRadius: 6,
        borderWidth: 1,
        backfaceVisibility: 'hidden',
    },
    flipCardBack: {
        width: Styling.contentWidth,
        height: height / 1.5,
        borderRadius: 6,
        position: 'absolute',
        top: 0,
    },
    headerButtonsContainer: {
        flex: 1.3,
        flexDirection: 'row',
        borderTopRightRadius: 6,
        borderTopLeftRadius: 6,
    },
    qrContainerFront: {
        flex: 3.75,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrContainerBack: {
        flex: 3.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressContainer: {
        flex: 2.75,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
    },
    multiInputContainer: {
        flex: 2.6,
        justifyContent: 'center',
        paddingHorizontal: width / 30,
        paddingVertical: height / 50,
        borderTopWidth: 1,
    },
    addressButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerButtonContainer: {
        flex: 1.3,
    },
    leftHeaderButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 6,
    },
    rightHeaderButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 6,
    },
    footerButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        borderWidth: 1,
    },
    refreshIconBackgroundAndroid: {
        width: width / 7,
        height: width / 7,
        borderRadius: width / 4,
        position: 'absolute',
        bottom: -width / 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        paddingTop: 1,
    },
    refreshIconBackground: {
        width: width / 7,
        height: width / 7,
        borderRadius: width / 4,
        position: 'absolute',
        top: -width / 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    refreshIcon: {
        backgroundColor: 'transparent',
    },
    buttonText: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: Styling.fontSize3,
    },
    addressText: {
        fontFamily: 'SourceCodePro-Medium',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        lineHeight: width / 17,
        justifyContent: 'center',
    },
    qrOptionsIndicator: {
        width: width / 60,
        height: width / 60,
        borderRadius: width / 30,
        position: 'absolute',
        top: width / 40,
        right: width / 40,
        zIndex: 2,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        textAlign: 'center',
        paddingHorizontal: width / 12,
        paddingBottom: height / 25,
    },
});

/** Receive screen component */
class Receive extends Component {
    static propTypes = {
        /** Currently selected account information - Contains addresses, transfers and balance */
        selectedAccountData: PropTypes.object.isRequired,
        /** Name of currently selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** @ignore */
        isSyncing: PropTypes.bool.isRequired,
        /** @ignore */
        receiveAddress: PropTypes.string.isRequired,
        /** @ignore */
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        /** @ignore */
        isGettingSensitiveInfoToGenerateAddress: PropTypes.bool.isRequired,
        /** @ignore */
        generateNewAddress: PropTypes.func.isRequired,
        /** @ignore */
        closeTopBar: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        getFromKeychainRequest: PropTypes.func.isRequired,
        /** @ignore */
        getFromKeychainSuccess: PropTypes.func.isRequired,
        /** @ignore */
        getFromKeychainError: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isTransitioning: PropTypes.bool.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        qrMessage: PropTypes.string.isRequired,
        /** @ignore */
        qrAmount: PropTypes.string.isRequired,
        /** @ignore */
        qrTag: PropTypes.string.isRequired,
        /** @ignore */
        qrDenomination: PropTypes.string.isRequired,
        /** @ignore */
        currency: PropTypes.string.isRequired,
        /** @ignore */
        usdPrice: PropTypes.number.isRequired,
        /** @ignore */
        conversionRate: PropTypes.number.isRequired,
        /** @ignore */
        hadErrorGeneratingNewAddress: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            currencySymbol: getCurrencySymbol(props.currency),
            scramblingLetters: [],
            hasSuccessfullyGeneratedAddress: false,
            isCardFlipped: false,
            displayInfo: true,
            displayCard: false,
        };
        this.generateAddress = this.generateAddress.bind(this);
        this.flipCard = this.flipCard.bind(this);
    }

    componentWillMount() {
        this.scrambleLetters();
        this.rotateAnimatedValue = new Animated.Value(0);
        this.flipAnimatedValue = new Animated.Value(0);
        this.scaleAnimatedValueFront = new Animated.Value(0);
        this.scaleAnimatedValueBack = new Animated.Value(0);
        this.opacityAnimatedValue = new Animated.Value(0);

        this.rotateInterpolate = this.rotateAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
        });
        this.flipInterpolateFront = this.flipAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
        });
        this.flipInterpolateBack = this.flipAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['180deg', '360deg'],
        });
        this.scaleInterpolateFront = this.scaleAnimatedValueFront.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.875],
        });
        this.scaleInterpolateBack = this.scaleAnimatedValueBack.interpolate({
            inputRange: [0, 1],
            outputRange: [0.875, 1],
        });
        this.frontOpacity = this.opacityAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
        });
        this.backOpacity = this.opacityAnimatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('Receive');
        timer.clearInterval('scramble');
        timer.clearTimeout('delayCardAnimation');
        timer.clearTimeout('delayAddressInfoAnimation');
    }

    componentWillReceiveProps(newProps) {
        if (this.props.isGeneratingReceiveAddress && !newProps.isGeneratingReceiveAddress) {
            timer.clearInterval('scramble');
            if (!newProps.hadErrorGeneratingNewAddress) {
                this.setState({ hasSuccessfullyGeneratedAddress: true, displayCard: true });
                timer.setTimeout('delayCardAnimation', () => this.setState({ displayInfo: false }), 300);
            }
        }
        if (!this.props.hadErrorGeneratingNewAddress && newProps.hadErrorGeneratingNewAddress) {
            this.setState({ hasSuccessfullyGeneratedAddress: false });
        }
        if (this.props.selectedAccountName !== newProps.selectedAccountName) {
            this.setState({ hasSuccessfullyGeneratedAddress: false });
            timer.setTimeout(
                'delayAddressInfoAnimation',
                () => this.setState({ displayCard: false, displayInfo: true }),
                300,
            );
        }
    }

    shouldComponentUpdate(newProps) {
        const { isSyncing, isTransitioning } = this.props;
        if (isSyncing !== newProps.isSyncing) {
            return false;
        }
        if (isTransitioning !== newProps.isTransitioning) {
            return false;
        }
        return true;
    }

    /**
     *   Copies receive address to clipboard.
     *   @method onCopyAddressPress
     **/
    onCopyAddressPress() {
        const { t, receiveAddress, isGeneratingReceiveAddress } = this.props;
        if (!this.state.hasSuccessfullyGeneratedAddress || isGeneratingReceiveAddress) {
            return this.props.generateAlert('error', t('generateAnAddressTitle'), t('generateAnAddressExplanation'));
        }
        Clipboard.setString(receiveAddress);
        this.props.generateAlert('success', t('addressCopied'), t('addressCopiedExplanation'));
    }

    /**
     *   Captures QR code and opens share intent.
     *   @method onShareQRCodePress
     **/
    async onShareQRCodePress() {
        const { receiveAddress } = this.props;
        // Ensure user has granted necessary permission on Android
        if (isAndroid) {
            await getAndroidFileSystemPermissions();
        }
        if (receiveAddress) {
            captureRef(this.qr, { format: 'png', result: 'data-uri' }).then((url) => {
                Share.open({
                    url,
                    type: 'image/png',
                }).catch((err) => {
                    // Handles promise rejection from `react-native-share` so that Bugsnag does not report it as an error
                    /*eslint-disable no-console*/
                    console.log(err);
                });
            });
        }
    }

    /**
     *   Gets transaction value for QR code JSON.
     *   If amount field is empty or invalid set value to 0.
     *   @method getQrValue
     *   @returns {number}
     **/
    getQrValue() {
        const { qrAmount, qrDenomination } = this.props;
        const { currencySymbol } = this.state;
        const isFiat = qrDenomination === currencySymbol;
        const formattedAmount = isValidAmount(qrAmount, this.getUnitMultiplier(), isFiat) && qrAmount ? qrAmount : 0;
        const value = parseInt(parseFloat(formattedAmount) * this.getUnitMultiplier(), 10);
        return value;
    }

    /**
     *   Gets multiplier used in converting IOTA denominations (Ti, Gi, Mi, Ki, i) and fiat to basic IOTA unit (i) for QR Code.
     *   @method getUnitMultiplier
     *   @returns {number}
     **/
    getUnitMultiplier() {
        const { usdPrice, conversionRate, qrDenomination } = this.props;
        const { currencySymbol } = this.state;
        if (qrDenomination === currencySymbol) {
            return 1000000 / usdPrice / conversionRate;
        }
        return getIOTAUnitMultiplier(qrDenomination);
    }

    /**
     *   Gets a random character from valid receive address characters
     *   @method getRandomChar
     **/
    getRandomChar() {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
        return charset.charAt(Math.floor(Math.random() * 27));
    }

    /**
     *   Starts scrambling letters at random intervals
     *   @method startLetterScramble
     **/
    startLetterScramble() {
        timer.setInterval(
            'scramble',
            () => this.scrambleLetters(),
            isAndroid ? Math.floor(Math.random() * 125) + 50 : Math.floor(Math.random() * 100) + 25,
        );
    }

    /**
     *   Updates state with a random array of 90 letters
     *   @method scrambleLetters
     **/
    scrambleLetters() {
        const scramblingLetters = [];
        for (let j = 0; j < 90; j++) {
            scramblingLetters.push(this.getRandomChar());
        }
        this.setState({ scramblingLetters });
    }

    /**
     *   Gets seed from keychain and generates receive address.
     *   @method generateAddress
     **/
    async generateAddress() {
        const { t, selectedAccountData, selectedAccountName, isSyncing, isTransitioning, isGeneratingReceiveAddress } = this.props;
        if (isGeneratingReceiveAddress) {
            return;
        }
        if (isSyncing || isTransitioning) {
            return this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }
        const error = () => {
            this.props.getFromKeychainError('receive', 'addressGeneration');
            return this.props.generateAlert(
                'error',
                t('global:somethingWentWrong'),
                t('global:somethingWentWrongTryAgain'),
            );
        };
        this.startLetterScramble();
        this.triggerRefreshAnimations();
        this.props.getFromKeychainRequest('receive', 'addressGeneration');

        try {
            const seedStore = await new SeedStore[selectedAccountData.type || 'keychain'](
                global.passwordHash,
                selectedAccountName,
            );
            this.props.getFromKeychainSuccess('receive', 'addressGeneration');
            this.props.generateNewAddress(seedStore, selectedAccountName, selectedAccountData);
        } catch (err) {
            return error();
        }
    }

    clearInteractions() {
        this.props.closeTopBar();
        Keyboard.dismiss();
    }

    triggerRefreshAnimations() {
        this.animateIcon();
    }

    /**
     *   Animates refresh icon while an address is being generated.
     *   @method animateIcon
     **/
    animateIcon() {
        this.rotateAnimatedValue.setValue(0);
        Animated.sequence([
            Animated.spring(this.rotateAnimatedValue, {
                toValue: 1,
                useNativeDriver: true,
                friction: 20,
                tension: 30,
            }),
        ]).start(() => {
            const { isGeneratingReceiveAddress, isGettingSensitiveInfoToGenerateAddress } = this.props;
            if (isGeneratingReceiveAddress || isGettingSensitiveInfoToGenerateAddress) {
                this.animateIcon();
            }
        });
    }

    /**
     *   Animates flipcard.
     *   @method flipCard
     **/
    flipCard() {
        const { isCardFlipped } = this.state;
        const toValue = isCardFlipped ? 0 : 1;

        Animated.parallel([
            Animated.timing(isCardFlipped ? this.scaleAnimatedValueBack : this.scaleAnimatedValueFront, {
                toValue,
                duration: 100,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(this.flipAnimatedValue, {
                toValue,
                duration: 300,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(this.opacityAnimatedValue, {
                toValue,
                delay: 150,
                duration: 1,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(isCardFlipped ? this.scaleAnimatedValueFront : this.scaleAnimatedValueBack, {
                toValue,
                duration: 100,
                easing: Easing.linear,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start(() => this.setState({ isCardFlipped: !isCardFlipped }));
    }

    render() {
        const {
            t,
            theme: { primary, dark, positive, body },
            isGeneratingReceiveAddress,
            qrMessage,
            qrTag,
            receiveAddress,
        } = this.props;
        const {
            scramblingLetters,
            hasSuccessfullyGeneratedAddress,
            isCardFlipped,
            displayCard,
            displayInfo,
        } = this.state;
        const qrContent = JSON.stringify({
            address: receiveAddress,
            amount: this.getQrValue(),
            message: qrMessage,
            tag: qrTag,
        });
        const qrOptionsActive = this.getQrValue() !== 0 || qrMessage.length > 0 || qrTag.length > 0;
        const rotateStyle = { rotate: this.rotateInterpolate };
        const flipStyleFront = { rotateY: this.flipInterpolateFront };
        const flipStyleBack = { rotateY: this.flipInterpolateBack };
        const scaleStyleFront = { scale: this.scaleInterpolateFront };
        const scaleStyleBack = { scale: this.scaleInterpolateBack };

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.clearInteractions()}>
                <View style={styles.container}>
                    {displayInfo && (
                        <AnimatedComponent
                            animationInType={['fadeIn']}
                            animationOutType={['fadeOut']}
                            animateOutTrigger={hasSuccessfullyGeneratedAddress}
                            style={{ position: 'absolute' }}
                        >
                            <InfoBox>
                                <Text style={[styles.infoText, { color: body.color }]}>
                                    {t('generateAddressInformation')}
                                </Text>
                                <CtaButton
                                    ctaColor={primary.color}
                                    ctaBorderColor={primary.color}
                                    secondaryCtaColor={primary.body}
                                    text={t('generateAnAddress')}
                                    onPress={() => {
                                        this.generateAddress();
                                    }}
                                    ctaWidth={width / 1.6}
                                    ctaHeight={height / 12}
                                    displayActivityIndicator={
                                        isGeneratingReceiveAddress || hasSuccessfullyGeneratedAddress
                                    }
                                />
                            </InfoBox>
                        </AnimatedComponent>
                    )}
                    {displayCard && (
                        <AnimatedComponent
                            animationInType={['slideInBottom', 'fadeIn']}
                            animationOutType={['fadeOut']}
                            duration={400}
                            animateOutTrigger={hasSuccessfullyGeneratedAddress}
                        >
                            <Animated.View
                                style={[
                                    styles.flipCard,
                                    { borderColor: primary.border },
                                    { zIndex: isCardFlipped ? 0 : 1 },
                                    { opacity: this.frontOpacity },
                                    {
                                        transform: [{ perspective: 1000 }, flipStyleFront, scaleStyleFront],
                                    },
                                ]}
                                pointerEvents={isCardFlipped ? 'none' : 'auto'}
                            >
                                {qrOptionsActive && (
                                    <View style={[styles.qrOptionsIndicator, { backgroundColor: positive.color }]} />
                                )}
                                <View style={styles.headerButtonsContainer}>
                                    <View style={[styles.leftHeaderButton, { backgroundColor: '#F2F2F2' }]}>
                                        <Text style={[styles.buttonText, { color: 'black' }]}>{t('yourAddress')}</Text>
                                    </View>
                                    <TouchableWithoutFeedback onPress={this.flipCard}>
                                        <View style={[styles.rightHeaderButton, { backgroundColor: primary.color }]}>
                                            <Text style={[styles.buttonText, { color: primary.body }]}>
                                                {t('qrOptions')}
                                            </Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                                <View
                                    style={[
                                        styles.qrContainerFront,
                                        { backgroundColor: '#F2F2F2', paddingBottom: width / 25 },
                                    ]}
                                >
                                    {!isGeneratingReceiveAddress &&
                                        hasSuccessfullyGeneratedAddress && (
                                            <CustomQrCodeComponent value={qrContent} size={isAndroid ? width / 2 : width / 3} />
                                        )}
                                    {/* FIXME: Overflow: 'visible' is not supported on Android*/}
                                    {isAndroid && (
                                        <TouchableWithoutFeedback onPress={this.generateAddress}>
                                            <View
                                                style={[
                                                    styles.refreshIconBackgroundAndroid,
                                                    { backgroundColor: dark.color, borderColor: primary.border },
                                                ]}
                                            >
                                                <Animated.View style={{ transform: [rotateStyle] }}>
                                                    <Icon
                                                        name="sync"
                                                        size={width / 12}
                                                        color={dark.body}
                                                        style={styles.refreshIcon}
                                                    />
                                                </Animated.View>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    )}
                                </View>
                                <TouchableWithoutFeedback onPress={this.generateAddress}>
                                    <View
                                        style={[
                                            styles.addressContainer,
                                            { backgroundColor: dark.color, borderColor: primary.border },
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.refreshIconBackground,
                                                { backgroundColor: dark.color, borderColor: primary.border },
                                            ]}
                                        >
                                            <Animated.View style={{ transform: [rotateStyle] }}>
                                                <Icon
                                                    name="sync"
                                                    size={width / 12}
                                                    color={dark.body}
                                                    style={styles.refreshIcon}
                                                />
                                            </Animated.View>
                                        </View>
                                        {hasSuccessfullyGeneratedAddress && (
                                            <View>
                                                <ScramblingText
                                                    scramble={isGeneratingReceiveAddress}
                                                    textStyle={[styles.addressText, { color: dark.body }]}
                                                    scramblingLetters={scramblingLetters}
                                                    rowIndex={0}
                                                >
                                                    {receiveAddress.substring(0, 30)}
                                                </ScramblingText>
                                                <ScramblingText
                                                    scramble={isGeneratingReceiveAddress}
                                                    textStyle={[styles.addressText, { color: dark.body }]}
                                                    scramblingLetters={scramblingLetters}
                                                    rowIndex={1}
                                                >
                                                    {receiveAddress.substring(30, 60)}
                                                </ScramblingText>
                                                <ScramblingText
                                                    scramble={isGeneratingReceiveAddress}
                                                    textStyle={[styles.addressText, { color: dark.body }]}
                                                    scramblingLetters={scramblingLetters}
                                                    rowIndex={2}
                                                >
                                                    {receiveAddress.substring(60, 90)}
                                                </ScramblingText>
                                            </View>
                                        )}
                                    </View>
                                </TouchableWithoutFeedback>
                                <View
                                    style={[
                                        styles.footerButtonContainer,
                                        { opacity: isGeneratingReceiveAddress ? 0.5 : 1 },
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.footerButton,
                                            { backgroundColor: primary.color, borderColor: primary.border },
                                        ]}
                                        onPress={() => this.onCopyAddressPress()}
                                    >
                                        <Text style={[styles.buttonText, { color: primary.body }]}>
                                            {t('copyAddress')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                            <Animated.View
                                pointerEvents={isCardFlipped ? 'auto' : 'none'}
                                style={[
                                    styles.flipCard,
                                    styles.flipCardBack,
                                    { borderColor: primary.border },
                                    { zIndex: isCardFlipped ? 1 : 0 },
                                    { opacity: this.backOpacity },
                                    {
                                        transform: [{ perspective: 1000 }, flipStyleBack, scaleStyleBack],
                                    },
                                ]}
                            >
                                {qrOptionsActive && (
                                    <View style={[styles.qrOptionsIndicator, { backgroundColor: positive.color }]} />
                                )}
                                <View style={styles.headerButtonsContainer}>
                                    <TouchableWithoutFeedback onPress={this.flipCard}>
                                        <View style={[styles.leftHeaderButton, { backgroundColor: primary.color }]}>
                                            <Text style={[styles.buttonText, { color: primary.body }]}>
                                                {t('yourAddress')}
                                            </Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={[styles.rightHeaderButton, { backgroundColor: '#F2F2F2' }]}>
                                        <Text style={[styles.buttonText, { color: 'black' }]}>{t('qrOptions')}</Text>
                                    </View>
                                </View>
                                <View style={[styles.qrContainerBack, { backgroundColor: '#F2F2F2' }]}>
                                    <View
                                        style={{ backgroundColor: '#F2F2F2' }}
                                        ref={(c) => {
                                            this.qr = c;
                                        }}
                                    >
                                        <CustomQrCodeComponent value={qrContent} size={isAndroid ? width / 2 : width / 3} />
                                    </View>
                                </View>
                                <View
                                    style={[
                                        styles.multiInputContainer,
                                        { backgroundColor: dark.color, borderColor: primary.border },
                                    ]}
                                >
                                    <MultiTextInput multiplier={this.getUnitMultiplier()} />
                                </View>
                                <View style={styles.footerButtonContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.footerButton,
                                            { backgroundColor: primary.color, borderColor: primary.border },
                                        ]}
                                        onPress={() => this.onShareQRCodePress()}
                                    >
                                        <Text style={[styles.buttonText, { color: primary.body }]}>{t('shareQr')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </AnimatedComponent>
                    )}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    selectedAccountData: selectAccountInfo(state),
    selectedAccountName: getSelectedAccountName(state),
    isSyncing: state.ui.isSyncing,
    receiveAddress: selectLatestAddressFromAccountFactory()(state),
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isGettingSensitiveInfoToGenerateAddress: state.keychain.isGettingSensitiveInfo.receive.addressGeneration,
    theme: getThemeFromState(state),
    isTransitioning: state.ui.isTransitioning,
    qrMessage: state.ui.qrMessage,
    qrAmount: state.ui.qrAmount,
    qrTag: state.ui.qrTag,
    qrDenomination: state.ui.qrDenomination,
    currency: state.settings.currency,
    usdPrice: state.marketData.usdPrice,
    conversionRate: state.settings.conversionRate,
    hadErrorGeneratingNewAddress: state.ui.hadErrorGeneratingNewAddress,
});

const mapDispatchToProps = {
    generateNewAddress,
    generateAlert,
    getFromKeychainRequest,
    getFromKeychainSuccess,
    getFromKeychainError,
};

export default withNamespaces(['receive', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Receive));
