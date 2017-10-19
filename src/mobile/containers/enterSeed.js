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
import { setSeed } from '../../shared/actions/iotaActions';
import Modal from 'react-native-modal';

//import DropdownHolder from './dropdownHolder';

const { height, width } = Dimensions.get('window');
const StatusBarDefaultBarStyle = 'light-content';
//const dropdown = DropdownHolder.getDropDown();

class EnterSeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            seed: '',
            isModalVisible: false,
        };
    }

    onDoneClick() {
        if (!this.state.seed.match(/^[A-Z9]+$/)) {
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
                screen: 'setPassword',
                navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png' },
                animated: false,
            });
        }
    }

    onBackClick() {
        this.props.navigator.pop({
            animated: false,
        });
    }
    onQRClick() {
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
        <QRScanner onQRRead={() => this.props.onQRRead(data)} hideModal={() => this._hideModal()} />
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
                                    <Text style={styles.title}>ENTER YOUR SEED</Text>
                                </View>
                            </View>
                            <View style={styles.midContainer}>
                                <View style={{ flexDirection: 'row', width: width / 1.42 }}>
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
                                            autoCorrect={false}
                                            value={seed}
                                            maxLength={81}
                                            onChangeText={seed => this.setState({ seed })}
                                        />
                                    </View>
                                    <View style={styles.qrButtonContainer}>
                                        <TouchableOpacity onPress={() => this.onQRClick()}>
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
                                <View style={{ paddingTop: height / 17 }}>
                                    <View style={styles.infoTextContainer}>
                                        <Image
                                            source={require('../../shared/images/info.png')}
                                            style={styles.infoIcon}
                                        />
                                        <Text style={styles.infoText}>
                                            Seeds should be 81 characters long, and should contain capital letters A-Z,
                                            or the number 9. You cannot use seeds longer than 81 characters.
                                        </Text>
                                        <Text style={styles.warningText}>NEVER SHARE YOUR SEED WITH ANYONE</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.bottomContainer}>
                                <View style={styles.buttonsContainer}>
                                    <TouchableOpacity onPress={event => this.onDoneClick()}>
                                        <View style={styles.doneButton}>
                                            <Text style={styles.doneText}>DONE</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <TouchableOpacity onPress={event => this.onBackClick()}>
                                        <View style={styles.backButton}>
                                            <Text style={styles.backText}>GO BACK</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
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
                    backdropColor={'#132d38'}
                    backdropOpacity={0.6}
                    style={{ alignItems: 'center' }}
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
        flex: 0.7,
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bottomContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 14,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 35,
    },
    title: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextContainer: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 15,
        width: width / 1.65,
        height: height / 3.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 15,
        borderStyle: 'dotted',
        paddingTop: height / 40,
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 29.6,
        textAlign: 'center',
        paddingTop: width / 30,
        backgroundColor: 'transparent',
    },
    warningText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 29.6,
        textAlign: 'center',
        paddingTop: height / 40,
        backgroundColor: 'transparent',
    },
    buttonsContainer: {
        alignItems: 'center',
        paddingBottom: height / 30,
    },
    doneButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 1.65,
        height: height / 17,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    backButton: {
        borderColor: '#F7D002',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 1.65,
        height: height / 17,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    doneText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        backgroundColor: 'transparent',
    },
    backText: {
        color: '#F7D002',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
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
        paddingRight: width / 20,
    },
    textField: {
        color: 'white',
        fontFamily: 'Lato-Light',
    },
    qrButtonContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height / 90,
    },
});

const mapStateToProps = state => ({
    marketData: state.marketData,
    iota: state.iota,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    setSeed: seed => {
        dispatch(setSeed(seed));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(EnterSeed);
