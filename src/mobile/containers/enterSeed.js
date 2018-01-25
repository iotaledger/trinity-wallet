import React from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image, StatusBar, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
import CustomTextInput from '../components/customTextInput';
import InfoBox from '../components/infoBox';
import { setSeed } from 'iota-wallet-shared-modules/actions/tempAccount';
import { VALID_SEED_REGEX, MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import { getChecksum } from 'iota-wallet-shared-modules/libs/iota';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import StatefulDropdownAlert from './statefulDropdownAlert';
import QRScanner from '../components/qrScanner';
import OnboardingButtons from '../components/onboardingButtons';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

class EnterSeed extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            seed: '',
            isModalVisible: false,
        };
    }

    handleKeyPress = event => {
        if (event.key == 'Enter') {
            Keyboard.dismiss();
        }
    };

    onDonePress() {
        const { t } = this.props;
        if (!this.state.seed.match(VALID_SEED_REGEX) && this.state.seed.length == MAX_SEED_LENGTH) {
            this.props.generateAlert('error', t('invalidCharacters'), t('invalidCharactersExplanation'));
        } else if (this.state.seed.length < MAX_SEED_LENGTH) {
            this.props.generateAlert(
                'error',
                t('seedTooShort'),
                t('seedTooShortExplanation', { maxLength: MAX_SEED_LENGTH, currentLength: this.state.seed.length }),
            );
        } else if (this.state.seed.length == MAX_SEED_LENGTH) {
            this.props.setSeed(this.state.seed);
            this.props.navigator.push({
                screen: 'setSeedName',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: COLORS.backgroundGreen,
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
        this._showModal();
    }

    onQRRead(data) {
        const dataString = data.toString();
        if (dataString.length == 81 && dataString.match(VALID_SEED_REGEX)) {
            this.setState({
                seed: data,
            });
        } else {
            this.props.generateAlert(
                'error',
                'Incorrect seed format',
                'Valid seeds should be 81 characters and contain only A-Z or 9.',
            );
        }
        this._hideModal();
    }

    _showModal = () => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    _renderModalContent = () => (
        <QRScanner
            backgroundColor={COLORS.backgroundGreen}
            ctaColor={COLORS.greenLight}
            onQRRead={data => this.onQRRead(data)}
            hideModal={() => this._hideModal()}
            secondaryCtaColor="white"
        />
    );

    getChecksumValue() {
        const { seed } = this.state;
        let checksumValue = '...';

        if (seed.length != 0 && seed.length < 81) {
            checksumValue = '< 81';
        } else if (seed.length == 81 && seed.match(VALID_SEED_REGEX)) {
            checksumValue = getChecksum(seed);
        }
        return checksumValue;
    }

    render() {
        const { seed } = this.state;
        const { t } = this.props;
        return (
            <TouchableWithoutFeedback style={{ flex: 0.8 }} onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <StatusBar barStyle="light-content" />
                    <View style={styles.topContainer}>
                        <View style={styles.logoContainer}>
                            <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                        </View>
                    </View>
                    <View style={styles.midContainer}>
                        <View style={{ flex: 0.5 }} />
                        <CustomTextInput
                            label={t('global:seed')}
                            onChangeText={seed => this.setState({ seed: seed.toUpperCase() })}
                            containerStyle={{ width: width / 1.36 }}
                            autoCapitalize={'characters'}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            onSubmitEditing={() => this.onDonePress()}
                            maxLength={MAX_SEED_LENGTH}
                            secondaryBackgroundColor="white"
                            value={seed}
                            widget="qr"
                            onQRPress={() => this.onQRPress()}
                        />
                        <View style={{ flex: 0.4 }} />
                        <View style={styles.checksum}>
                            <Text style={styles.checksumText}>{this.getChecksumValue()}</Text>
                        </View>
                        <View style={{ flex: 0.4 }} />
                        <InfoBox
                            text={
                                <View>
                                    <Text style={styles.infoText}>
                                        {t('seedExplanation', { maxLength: MAX_SEED_LENGTH })}
                                    </Text>
                                    <Text style={styles.warningText}>
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
                        />
                    </View>
                    <StatefulDropdownAlert />
                    <Modal
                        animationIn={'bounceInUp'}
                        animationOut={'bounceOut'}
                        animationInTiming={1000}
                        animationOutTiming={200}
                        backdropTransitionInTiming={500}
                        backdropTransitionOutTiming={200}
                        backdropColor={'#102832'}
                        backdropOpacity={1}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={this.state.isModalVisible}
                        onBackButtonPress={() => this.setState({ isModalVisible: false })}
                    >
                        {this._renderModalContent()}
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundGreen,
    },
    topContainer: {
        flex: 1,
        paddingTop: height / 22,
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
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    warningText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    infoIcon: {
        width: width / 20,
        height: width / 20,
    },
    checksum: {
        width: width / 8,
        height: height / 20,
        borderRadius: GENERAL.borderRadiusSmall,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checksumText: {
        fontSize: width / 29.6,
        color: 'white',
        fontFamily: 'Lato-Regular',
    },
});

const mapStateToProps = state => ({
    marketData: state.marketData,
    tempAccount: state.tempAccount,
    account: state.account,
});

const mapDispatchToProps = {
    setSeed,
    generateAlert,
};

export default translate(['enterSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(EnterSeed));
