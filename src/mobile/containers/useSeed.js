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
import { setPassword, setUsedSeedToLogin } from 'iota-wallet-shared-modules/actions/tempAccount';
import { getAccountInfo } from 'iota-wallet-shared-modules/actions/account';
import Modal from 'react-native-modal';
import OnboardingButtons from '../components/onboardingButtons.js';
import { storeSeedInKeychain } from 'iota-wallet-shared-modules/libs/cryptography';
import { MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'iota-wallet-shared-modules/libs/util';
import COLORS from '../theme/Colors';

//import DropdownHolder from './dropdownHolder';

import { width, height } from '../util/dimensions';
const StatusBarDefaultBarStyle = 'light-content';
//const dropdown = DropdownHolder.getDropDown();

class UseSeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            seed: '',
            isModalVisible: false,
        };
    }

    onDonePress() {
        if (!this.state.seed.match(VALID_SEED_REGEX) && this.state.seed.length >= 60) {
            this.dropdown.alertWithType(
                'error',
                'Seed contains invalid characters',
                `Seeds can only consist of the capital letters A-Z and the number 9. Your seed has invalid characters. Please try again.`,
            );
        } else if (this.state.seed.length < 60) {
            this.dropdown.alertWithType(
                'error',
                'Seed is too short',
                `Seeds must be at least 60 characters long (ideally ${
                    MAX_SEED_LENGTH
                } characters). Your seed is currently ${this.state.seed.length} characters long. Please try again.`,
            );
        } else if (this.state.seed.length >= 60) {
            this.props.getAccountInfoNewSeed(this.state.seed, 'usedSeed');
            this.props.navigator.push({
                screen: 'loading',
                navigatorStyle: { navBarHidden: true, navBarTransparent: true },
                animated: false,
                overrideBackPress: true,
            });
            this.props.setUsedSeedToLogin();
            this.props.setPassword('dummy');
            storeSeedInKeychain(this.props.tempAccount.password, this.state.seed, 'temp');
            this.setState({ seed: '' });
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
                                    <Text style={styles.title}>Please enter your seed.</Text>
                                </View>
                            </View>
                            <View style={styles.midContainer}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={styles.textFieldContainer}>
                                        <TextField
                                            style={styles.textField}
                                            labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                            labelFontSize={width / 31.8}
                                            fontSize={width / 20.7}
                                            labelPadding={3}
                                            baseColor="white"
                                            tintColor="#F7D002"
                                            enablesReturnKeyAutomatically={true}
                                            returnKeyType="done"
                                            label="Seed"
                                            autoCorrect={false}
                                            value={seed}
                                            maxLength={MAX_SEED_LENGTH}
                                            onChangeText={seed => this.setState({ seed })}
                                            secureTextEntry={true}
                                        />
                                    </View>
                                    <View style={styles.qrButtonContainer}>
                                        <TouchableOpacity onPress={() => this.onQRPress()}>
                                            <View style={styles.qrButton}>
                                                <Image source={cameraImagePath} style={styles.qrImage} />
                                                <Text style={styles.qrText}> QR </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.bottomContainer}>
                                <OnboardingButtons
                                    onLeftButtonPress={() => this.onBackPress()}
                                    onRightButtonPress={() => this.onDonePress()}
                                    leftText={'BACK'}
                                    rightText={'DONE'}
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
    midContainer: {
        flex: 4.8,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 4.5,
    },
    bottomContainer: {
        flex: 0.7,
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
        height: height / 3.7,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 30,
        borderStyle: 'dotted',
        paddingTop: height / 60,
        position: 'absolute',
        top: height / 3.3,
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
        borderWidth: 1,
        borderRadius: 8,
        width: width / 6,
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
    tempAccount: state.tempAccount,
});

const mapDispatchToProps = dispatch => ({
    getAccountInfo: seed => {
        dispatch(getAccountInfo(seed));
    },
    setUsedSeedToLogin: () => {
        dispatch(setUsedSeedToLogin());
    },
    setPassword: password => {
        dispatch(setPassword(password));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(UseSeed);
