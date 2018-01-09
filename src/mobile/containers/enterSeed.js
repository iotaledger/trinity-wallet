import React from 'react';
import { translate } from 'react-i18next';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    StatusBar,
    Keyboard,
} from 'react-native';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';
import { TextField } from 'react-native-material-textfield';
import { setSeed } from 'iota-wallet-shared-modules/actions/tempAccount';
import { VALID_SEED_REGEX, MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import { getChecksum } from 'iota-wallet-shared-modules/libs/iota';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import infoImagePath from 'iota-wallet-shared-modules/images/info-white.png';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import cameraImagePath from 'iota-wallet-shared-modules/images/camera-white.png';
import StatefulDropdownAlert from './statefulDropdownAlert';
import QRScanner from '../components/qrScanner';
import OnboardingButtons from '../components/onboardingButtons';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';
import { isAndroid } from '../util/device';

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
        this.setState({
            seed: data,
        });
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
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.container}>
                            <View style={styles.topContainer}>
                                <View style={styles.logoContainer}>
                                    <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                                </View>
                            </View>
                            <View style={styles.topMidContainer}>
                                <View style={{ flex: 1, justifyContent: 'center' }}>
                                    <View style={{ flex: 0.3 }} />
                                    <View style={styles.titleContainer}>
                                        <Text style={styles.title}>{t('global:enterSeed')}</Text>
                                    </View>
                                </View>
                                <View
                                    style={{ flex: 1, flexDirection: 'row', width: width / 1.4, alignItems: 'center' }}
                                >
                                    <View style={styles.textFieldContainer}>
                                        <TextField
                                            style={styles.textField}
                                            labelTextStyle={{ fontFamily: 'Inconsolata-Bold', fontSize: width / 20.7 }}
                                            labelFontSize={width / 31.8}
                                            fontSize={isAndroid ? width / 27.6 : width / 20.7}
                                            labelPadding={3}
                                            baseColor={'white'}
                                            tintColor={'#F7D002'}
                                            enablesReturnKeyAutomatically={true}
                                            returnKeyType={'done'}
                                            autoCapitalize={'characters'}
                                            label={t('global:seed')}
                                            autoCorrect={false}
                                            value={seed}
                                            maxLength={MAX_SEED_LENGTH}
                                            onChangeText={seed => this.setState({ seed: seed.toUpperCase() })}
                                            onSubmitEditing={() => this.onDonePress()}
                                        />
                                    </View>
                                    <View style={styles.qrButtonContainer}>
                                        <TouchableOpacity onPress={() => this.onQRPress()}>
                                            <View style={styles.qrButton}>
                                                <Image source={cameraImagePath} style={styles.qrImage} />
                                                <Text style={styles.qrText}>{t('global:qr')}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.checksum}>
                                    <Text style={styles.checksumText}>{this.getChecksumValue()}</Text>
                                </View>
                            </View>
                            <View style={styles.bottomMidContainer}>
                                <View style={styles.infoTextContainer}>
                                    <Image source={infoImagePath} style={styles.infoIcon} />
                                    <Text style={styles.infoText}>
                                        {t('seedExplanation', { maxLength: MAX_SEED_LENGTH })}
                                    </Text>
                                    <Text style={styles.warningText}>{t('neverShare')}</Text>
                                </View>
                            </View>
                            <View style={styles.bottomContainer}>
                                <OnboardingButtons
                                    onLeftButtonPress={() => this.onBackPress()}
                                    onRightButtonPress={() => this.onDonePress()}
                                    leftText={t('global:back')}
                                    rightText={t('global:next')}
                                />
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
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
        flex: 0.6,
        paddingTop: height / 22,
    },
    topMidContainer: {
        flex: 2.5,
        alignItems: 'center',
        width,
    },
    bottomMidContainer: {
        flex: 2.8,
        alignItems: 'center',
        justifyContent: 'center',
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
    title: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextContainer: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 1.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 30,
        borderStyle: 'dotted',
        paddingVertical: height / 35,
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    warningText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 70,
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
    qrImage: {
        height: width / 28,
        width: width / 28,
        marginRight: width / 100,
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 0.8,
        borderRadius: GENERAL.borderRadius,
        width: width / 6.5,
        height: height / 16,
    },
    qrText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    textFieldContainer: {
        flex: 1,
        paddingRight: width / 30,
        justifyContent: 'flex-end',
    },
    textField: {
        color: 'white',
        fontFamily: 'Inconsolata-Bold',
    },
    qrButtonContainer: {
        alignItems: 'center',
        paddingBottom: isAndroid ? height / 90 : height / 150,
        justifyContent: 'flex-end',
        height: height / 10,
    },
    dropdownTitle: {
        fontSize: width / 25.9,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        paddingLeft: width / 20,
        paddingRight: width / 15,
        paddingVertical: height / 30,
    },
    dropdownMessage: {
        fontSize: width / 29.6,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        paddingTop: height / 60,
    },
    dropdownImage: {
        marginLeft: width / 25,
        width: width / 12,
        height: width / 12,
        alignSelf: 'center',
    },
    checksum: {
        width: width / 8,
        height: height / 20,
        borderRadius: GENERAL.borderRadiusSmall,
        borderColor: 'white',
        borderWidth: height / 1000,
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
