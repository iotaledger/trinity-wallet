import React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    ScrollView,
    ImageBackground,
    StatusBar,
} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import DropdownAlert from 'react-native-dropdownalert';
import QRScanner from '../components/qrScanner.js';
import { Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { setSeed } from '../../shared/actions/tempAccount';
import Modal from 'react-native-modal';
import OnboardingButtons from '../components/onboardingButtons.js';
import { storeInKeychain, getFromKeychain } from '../../shared/libs/cryptography';
import { increaseSeedCount, addSeedName } from '../../shared/actions/account';
import { generateAlert } from '../../shared/actions/alerts';
import { incrementSeedIndex, clearTempData } from '../../shared/actions/tempAccount';
import { getAccountInfoNewSeed, getAccountInfo, setFirstUse } from '../../shared/actions/account';

import DropdownHolder from '../components/dropdownHolder';

const { height, width } = Dimensions.get('window');
const StatusBarDefaultBarStyle = 'light-content';

class AddAdditionalSeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            seed: '',
            seedName: '',
            isModalVisible: false,
        };
    }

    onDonePress() {
        if (!this.state.seed.match(/^[A-Z9]+$/) && this.state.seed.length >= 60) {
            this.dropdown.alertWithType(
                'error',
                'Seed contains invalid characters',
                `Seeds can only consist of the capital letters A-Z and the number 9. Your seed has invalid characters. Please try again.`,
            );
        } else if (this.state.seed.length < 60) {
            this.dropdown.alertWithType(
                'error',
                'Seed is too short',
                `Seeds must be at least 60 characters long (ideally 81 characters). Your seed is currently ${this.state
                    .seed.length} characters long. Please try again.`,
            );
        } else if (!(this.state.seedName.length > 0)) {
            this.dropdown.alertWithType('error', 'No nickname entered', `Please enter a nickname for your seed.`);
        } else if (this.props.account.seedNames.includes(this.state.seedName)) {
            this.dropdown.alertWithType(
                'error',
                'Nickname already in use',
                `Please use a unique nickname for your seed.`,
            );
        } else {
            console.log('Password: ' + this.props.tempAccount.password);

            storeInKeychain(
                this.props.tempAccount.password,
                this.state.seed,
                this.state.seedName,
                () => {
                    this.stopPolling();
                    this.props.clearTempData();
                    this.props.setFirstUse(true);
                    this.props.increaseSeedCount();
                    this.props.addSeedName(this.state.seedName);
                    Promise.resolve(this.props.getAccountInfoNewSeed(this.state.seed, this.state.seedName)).then(
                        this.props.navigator.push({
                            screen: 'loading',
                            navigatorStyle: {
                                navBarHidden: true,
                            },
                            animated: false,
                        }),
                    );
                },
                (type, title, message) => this.dropdown.alertWithType(type, title, message),
            );
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

    stopPolling() {
        for (var i = 1; i < 99999; i++) {
            window.clearInterval(i);
        }
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
        const { seed, seedName } = this.state;
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.container}>
                            <View style={styles.topContainer}>
                                <View style={styles.logoContainer}>
                                    <Image
                                        source={require('../../shared/images/iota-glow.png')}
                                        style={styles.iotaLogo}
                                    />
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
                                            label="Seed"
                                            autoCapitalize="characters"
                                            autoCorrect={false}
                                            value={seed}
                                            maxLength={81}
                                            onChangeText={seed => this.setState({ seed })}
                                            multiline
                                        />
                                    </View>
                                    <View style={styles.qrButtonContainer}>
                                        <TouchableOpacity onPress={() => this.onQRPress()}>
                                            <View style={styles.qrButton}>
                                                <Image
                                                    source={require('../../shared/images/camera.png')}
                                                    style={styles.qrImage}
                                                />
                                                <Text style={styles.qrText}> QR </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.seedNickNameContainer}>
                                    <View style={styles.subtitleContainer}>
                                        <Text style={styles.title}>Enter a seed nickname.</Text>
                                    </View>
                                    <TextField
                                        style={styles.textField}
                                        labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                        labelFontSize={width / 31.8}
                                        fontSize={width / 20.7}
                                        labelPadding={3}
                                        baseColor="white"
                                        tintColor="#F7D002"
                                        enablesReturnKeyAutomatically={true}
                                        label="Seed name"
                                        autoCapitalize="characters"
                                        autoCorrect={false}
                                        value={seedName}
                                        containerStyle={{ width: width / 1.36 }}
                                        onChangeText={seedName => this.setState({ seedName })}
                                    />
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
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.2,
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4.8,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 12,
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
        paddingBottom: height / 30,
    },
    subtitleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: height / 30,
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
        fontSize: 16,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        padding: 15,
    },
    dropdownMessage: {
        fontSize: 14,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownImage: {
        padding: 8,
        width: 36,
        height: 36,
        alignSelf: 'center',
    },
    seedNickNameContainer: {
        position: 'absolute',
        top: height / 3,
    },
});

const mapStateToProps = state => ({
    marketData: state.marketData,
    tempAccount: state.tempAccount,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    increaseSeedCount: () => {
        dispatch(increaseSeedCount());
    },
    incrementSeedIndex: () => {
        dispatch(incrementSeedIndex());
    },
    clearTempData: () => {
        dispatch(clearTempData());
    },
    addSeedName: newSeed => {
        dispatch(addSeedName(newSeed));
    },
    getAccountInfoNewSeed: (seed, seedName) => {
        dispatch(getAccountInfoNewSeed(seed, seedName));
    },
    getAccountInfo: (seedName, seedIndex, accountInfo) => {
        dispatch(getAccountInfo(seedName, seedIndex, accountInfo));
    },
    generateAlert: (error, title, message) => {
        dispatch(generateAlert(error, title, message));
    },
    setFirstUse: boolean => {
        dispatch(setFirstUse(boolean));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(AddAdditionalSeed);
