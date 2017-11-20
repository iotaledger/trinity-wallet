import merge from 'lodash/merge';
import React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    Platform,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    ScrollView,
    ImageBackground,
    StatusBar,
} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import QRScanner from '../components/qrScanner.js';
import { Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { setSeed } from '../../shared/actions/tempAccount';
import Modal from 'react-native-modal';
import OnboardingButtons from '../components/onboardingButtons.js';

const width = Dimensions.get('window').width
const height = global.height;
const isAndroid = Platform.OS === 'android';

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
        } else if (this.state.seed.length >= 60) {
            this.props.setSeed(this.state.seed);
            this.props.navigator.push({
                screen: 'setSeedName',
                navigatorStyle: { navBarHidden: true, navBarTransparent: true },
                animated: false,
                overrideBackPress: true
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
                                            labelTextStyle={{ fontFamily: 'Lato-Light', fontSize: width / 20.7 }}
                                            labelFontSize={width / 31.8}
                                            fontSize={isAndroid? width / 27.6 : width / 20.7}
                                            labelPadding={3}
                                            baseColor="white"
                                            tintColor="#F7D002"
                                            enablesReturnKeyAutomatically={true}
                                            returnKeyType="done"
                                            blurOnSubmit={true} //Dismisses keyboard upon pressing Done
                                            autoCapitalize="characters"
                                            label="Seed"
                                            autoCorrect={false}
                                            value={seed}
                                            maxLength={81}
                                            onChangeText={seed => this.setState({ seed })}
                                            multiline
                                            secureTextEntry={true}
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
                            </View>
                            <View style={styles.bottomContainer}>
                                <View style={styles.infoTextContainer}>
                                    <Image source={require('../../shared/images/info.png')} style={styles.infoIcon} />
                                    <Text style={styles.infoText}>
                                        Seeds should be 81 characters long, and should contain capital letters A-Z, or
                                        the number 9. You cannot use seeds longer than 81 characters.
                                    </Text>
                                    <Text style={styles.warningText}>NEVER SHARE YOUR SEED WITH ANYONE</Text>
                                </View>
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
        flex: 2.8,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 12,
    },
    bottomContainer: {
        flex: 2.7,
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
        paddingVertical: height / 60,
        marginBottom: height / 17
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

export default connect(mapStateToProps, mapDispatchToProps)(EnterSeed);
