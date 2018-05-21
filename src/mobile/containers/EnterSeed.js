import React from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, StatusBar, Keyboard } from 'react-native';
import { setSeed } from 'iota-wallet-shared-modules/actions/wallet';
import { VALID_SEED_REGEX, MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/iota/utils';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
import Checksum from '../components/Checksum';
import CustomTextInput from '../components/CustomTextInput';
import InfoBox from '../components/InfoBox';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import QRScannerComponent from '../components/QrScanner';
import OnboardingButtons from '../containers/OnboardingButtons';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import { isAndroid } from '../utils/device';
import GENERAL from '../theme/general';

console.ignoredYellowBox = ['Native TextInput'];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 5,
        alignItems: 'center',
        width,
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 0.8,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
});

/** Enter seed component */
class EnterSeed extends React.Component {
    static propTypes = {
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
        /** Sets seed in store
         * @param {string} seed
         */
        setSeed: PropTypes.func.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            seed: '',
            isModalVisible: false,
        };
    }

    /**
     * Validate seed
     */
    onDonePress() {
        const { t, theme } = this.props;
        const { seed } = this.state;
        if (!seed.match(VALID_SEED_REGEX) && seed.length === MAX_SEED_LENGTH) {
            this.props.generateAlert('error', t('invalidCharacters'), t('invalidCharactersExplanation'));
        } else if (seed.length < MAX_SEED_LENGTH) {
            this.props.generateAlert(
                'error',
                t('seedTooShort'),
                t('seedTooShortExplanation', { maxLength: MAX_SEED_LENGTH, currentLength: seed.length }),
            );
        } else if (seed.length === MAX_SEED_LENGTH) {
            this.props.setSeed(seed);
            this.props.navigator.push({
                screen: 'setAccountName',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    drawUnderStatusBar: true,
                    topBarElevationShadowEnabled: false,
                    statusBarColor: theme.body.bg,
                    screenBackgroundColor: theme.body.bg,
                },
                animated: false,
            });
        }
    }

    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }
    onQRPress() {
        this.showModal();
    }

    /**
     * Parse and validate QR data
     * @param  {String} data QR data
     */
    onQRRead(data) {
        const dataString = data.toString();
        const { t } = this.props;
        if (dataString.length === 81 && dataString.match(VALID_SEED_REGEX)) {
            this.setState({
                seed: data,
            });
        } else {
            this.props.generateAlert('error', t('invalidCharacters'), t('invalidCharactersExplanation'));
        }
        this.hideModal();
    }

    showModal = () => this.setState({ isModalVisible: true });

    hideModal = () => this.setState({ isModalVisible: false });

    handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            Keyboard.dismiss();
        }
    };

    renderModalContent = () => {
        const { theme: { body, primary } } = this.props;

        return (
            <QRScannerComponent
                primary={primary}
                body={body}
                onQRRead={(data) => this.onQRRead(data)}
                hideModal={() => this.hideModal()}
            />
        );
    };

    render() {
        const { seed } = this.state;
        const { t, theme } = this.props;

        return (
            <TouchableWithoutFeedback style={{ flex: 0.8 }} onPress={Keyboard.dismiss} accessible={false}>
                <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                    <StatusBar barStyle="light-content" backgroundColor={theme.body.bg} />
                    <View style={styles.topContainer}>
                        <View style={styles.logoContainer}>
                            <Icon name="iota" size={width / 8} color={theme.body.color} />
                        </View>
                    </View>
                    <View style={styles.midContainer}>
                        <View style={{ flex: 0.5 }} />
                        <CustomTextInput
                            label={t('global:seed')}
                            onChangeText={(text) => this.setState({ seed: text.toUpperCase() })}
                            containerStyle={{ width: width / 1.2 }}
                            theme={theme}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            onSubmitEditing={() => this.onDonePress()}
                            maxLength={MAX_SEED_LENGTH}
                            value={seed}
                            widget="qr"
                            onQRPress={() => this.onQRPress()}
                            testID="enterSeed-seedbox"
                        />
                        <View style={{ flex: 0.4 }} />
                        <Checksum seed={seed} theme={theme} />
                        <View style={{ flex: 0.4 }} />
                        <InfoBox
                            body={theme.body}
                            text={
                                <View>
                                    <Text style={[styles.infoText, { color: theme.body.color }]}>
                                        {t('seedExplanation', { maxLength: MAX_SEED_LENGTH })}
                                    </Text>
                                    <Text style={[styles.warningText, { color: theme.body.color }]}>
                                        {'\n'}
                                        {t('neverShare')}
                                    </Text>
                                </View>
                            }
                        />
                        <View style={{ flex: 0.7 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <OnboardingButtons
                            onLeftButtonPress={() => this.onBackPress()}
                            onRightButtonPress={() => this.onDonePress()}
                            leftText={t('global:back')}
                            rightText={t('global:next')}
                            leftButtonTestID="enterSeed-back"
                            rightButtonTestID="enterSeed-next"
                        />
                    </View>
                    <StatefulDropdownAlert textColor="white" backgroundColor={theme.body.bg} />
                    <Modal
                        animationIn={isAndroid ? 'bounceInUp' : 'zoomIn'}
                        animationOut={isAndroid ? 'bounceOut' : 'zoomOut'}
                        animationInTiming={isAndroid ? 1000 : 300}
                        animationOutTiming={200}
                        backdropTransitionInTiming={isAndroid ? 500 : 300}
                        backdropTransitionOutTiming={200}
                        backdropColor="#102832"
                        backdropOpacity={1}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={this.state.isModalVisible}
                        onBackButtonPress={() => this.setState({ isModalVisible: false })}
                        hideModalContentWhileAnimating
                        useNativeDriver={isAndroid ? true : false}
                    >
                        {this.renderModalContent()}
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setSeed,
    generateAlert,
};

export default translate(['enterSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(EnterSeed));
