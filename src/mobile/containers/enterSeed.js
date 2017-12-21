import merge from 'lodash/merge';
import React from 'react';
import { translate } from 'react-i18next';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    ScrollView,
    StatusBar,
} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import QRScanner from '../components/qrScanner.js';
import { Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { setSeed } from 'iota-wallet-shared-modules/actions/tempAccount';
import { VALID_SEED_REGEX, MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import Modal from 'react-native-modal';
import OnboardingButtons from '../components/onboardingButtons.js';
import COLORS from '../theme/Colors';

import infoImagePath from 'iota-wallet-shared-modules/images/info.png';
import blueBackgroundImagePath from 'iota-wallet-shared-modules/images/bg-blue.png';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import cameraImagePath from 'iota-wallet-shared-modules/images/camera.png';
import { width, height } from '../util/dimensions';
import { isAndroid } from '../util/device';
const StatusBarDefaultBarStyle = 'light-content';

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
            this.dropdown.alertWithType('error', t('invalidCharacters'), t('invalidCharactersExplanation'));
        } else if (this.state.seed.length < MAX_SEED_LENGTH) {
            this.dropdown.alertWithType(
                'error',
                t('seedTooShort'),
                t('seedTooShortExplanation', { maxLength: MAX_SEED_LENGTH, currentLength: this.state.seed.length }),
            );
        } else if (this.state.seed.length == MAX_SEED_LENGTH) {
            this.props.setSeed(this.state.seed);
            this.props.navigator.push({
                screen: 'setSeedName',
                navigatorStyle: { navBarHidden: true, navBarTransparent: true },
                animated: false,
                overrideBackPress: true,
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
        <QRScanner onQRRead={data => this.onQRRead(data)} hideModal={() => this._hideModal()} />
    );

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
                                <View style={styles.titleContainer}>
                                    <Text style={styles.title}>{t('global:enterSeed')}</Text>
                                </View>
                            </View>
                            <View style={styles.topMidContainer}>
                                <View style={{ flexDirection: 'row' }}>
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
                <DropdownAlert
                    ref={ref => (this.dropdown = ref)}
                    successColor="#009f3f"
                    errorColor="#A10702"
                    titleStyle={styles.dropdownTitle}
                    defaultTextContainer={styles.dropdownTextContainer}
                    messageStyle={styles.dropdownMessage}
                    imageStyle={styles.dropdownImage}
                    inactiveStatusBarStyle={StatusBarDefaultBarStyle}
                />
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
        flex: 1.2,
        paddingTop: height / 22,
    },
    topMidContainer: {
        flex: 1.9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomMidContainer: {
        flex: 2.4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 15,
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
        borderRadius: 15,
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
        borderRadius: 8,
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
    },
    textField: {
        color: 'white',
        fontFamily: 'Inconsolata-Bold',
    },
    qrButtonContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height / 90,
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
});

const mapStateToProps = state => ({
    marketData: state.marketData,
    tempAccount: state.tempAccount,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    setSeed: seed => {
        dispatch(setSeed(seed));
    },
});

export default translate(['enterSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(EnterSeed));
