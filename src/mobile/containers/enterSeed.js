import React from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, StatusBar, Keyboard } from 'react-native';
import { setSeed } from 'iota-wallet-shared-modules/actions/tempAccount';
import { VALID_SEED_REGEX, MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
import Checksum from '../components/checksum';
import CustomTextInput from '../components/customTextInput';
import InfoBox from '../components/infoBox';
import StatefulDropdownAlert from './statefulDropdownAlert';
import QRScanner from '../components/qrScanner';
import OnboardingButtons from '../components/onboardingButtons';
import { width, height } from '../util/dimensions';
import { Icon } from '../theme/icons.js';

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
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
});

class EnterSeed extends React.Component {
    static propTypes = {
        generateAlert: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        setSeed: PropTypes.func.isRequired,
        navigator: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
        input: PropTypes.object.isRequired,
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
        const { t, body } = this.props;
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
                screen: 'setSeedName',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                    screenBackgroundColor: body.bg,
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
        const { body, primary } = this.props;
        return (
            <QRScanner
                primary={primary}
                body={body}
                onQRRead={(data) => this.onQRRead(data)}
                hideModal={() => this.hideModal()}
            />
        );
    };

    render() {
        const { seed } = this.state;
        const { t, body, theme, input } = this.props;
        return (
            <TouchableWithoutFeedback style={{ flex: 0.8 }} onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" backgroundColor={body.bg} />
                    <View style={styles.topContainer}>
                        <View style={styles.logoContainer}>
                            <Icon name="iota" size={width / 8} color={body.color} />
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
                        <Checksum seed={seed} input={input} />
                        <View style={{ flex: 0.4 }} />
                        <InfoBox
                            body={body}
                            text={
                                <View>
                                    <Text style={[styles.infoText, { color: body.color }]}>
                                        {t('seedExplanation', { maxLength: MAX_SEED_LENGTH })}
                                    </Text>
                                    <Text style={[styles.warningText, { color: body.color }]}>
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
                    <StatefulDropdownAlert textColor="white" backgroundColor={body.bg} />
                    <Modal
                        animationIn="bounceInUp"
                        animationOut="bounceOut"
                        animationInTiming={1000}
                        animationOutTiming={200}
                        backdropTransitionInTiming={500}
                        backdropTransitionOutTiming={200}
                        backdropColor="#102832"
                        backdropOpacity={1}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={this.state.isModalVisible}
                        onBackButtonPress={() => this.setState({ isModalVisible: false })}
                        useNativeDriver
                        hideModalContentWhileAnimating
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
    body: state.settings.theme.body,
    primary: state.settings.theme.primary,
    input: state.settings.theme.input,
});

const mapDispatchToProps = {
    setSeed,
    generateAlert,
};

export default translate(['enterSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(EnterSeed));
