import React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    ImageBackground,
    ScrollView,
    StatusBar,
} from 'react-native';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getMarketData, getChartData, getPrice } from '../../shared/actions/marketData';
import { getCurrencyData, setFullNode } from '../../shared/actions/settings';
import { setPassword, clearTempData, setReady } from '../../shared/actions/tempAccount';
import { getAccountInfo, getAccountInfoNewSeed } from '../../shared/actions/account';
import { changeHomeScreenRoute } from '../../shared/actions/home';
import { getFromKeychain, getSeed } from '../../shared/libs/cryptography';
import { TextField } from 'react-native-material-textfield';
import OnboardingButtons from '../components/onboardingButtons.js';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import DropdownHolder from '../components/dropdownHolder';
import { Keyboard } from 'react-native';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import IOTA from 'iota.lib.js';
import Modal from 'react-native-modal';
import { changeIotaNode } from '../../shared/libs/iota';
import NodeSelection from '../components/nodeSelection.js';

const StatusBarDefaultBarStyle = 'light-content';

const width = Dimensions.get('window').width;
const height = global.height;

var HockeyApp = require('react-native-hockeyapp');

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            isModalVisible: false,
        };
        this.onLoginPress = this.onLoginPress.bind(this);
        this.onNodeError = this.onNodeError.bind(this);
    }

    _showModal = data => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    navigateToNodeSelection() {
        this._hideModal();
        this.setState({ changingNode: true });
    }

    _renderModalContent = () => (
        <ImageBackground
            source={require('../../shared/images/bg-blue.png')}
            style={{ width: width / 1.15, alignItems: 'center' }}
        >
            <View style={styles.modalContent}>
                <Text style={styles.questionText}>Do you want to select a different node?</Text>
                <OnboardingButtons
                    onLeftButtonPress={() => this._hideModal()}
                    onRightButtonPress={() => this.navigateToNodeSelection()}
                    leftText={'NO'}
                    rightText={'YES'}
                />
            </View>
        </ImageBackground>
    );

    getWalletData() {
        this.props.getChartData();
        this.props.getPrice();
        this.props.getMarketData();
    }

    onLoginPress() {
        if (!this.state.password) {
            this.dropdown.alertWithType(
                'error',
                'Empty password',
                'You must enter a password to log in. Please try again.',
            );
        } else {
            getFromKeychain(this.state.password, value => {
                this.props.setPassword(this.state.password);
                if (value) {
                    var seed = getSeed(value, 0);
                    login(seed);
                } else {
                    error();
                }
            });
        }

        error = () => {
            this.dropdown.alertWithType(
                'error',
                'Unrecognised password',
                'The password was not recognised. Please try again.',
            );
        };

        login = value => {
            const seedIndex = this.props.tempAccount.seedIndex;
            const seedName = this.props.account.seedNames[seedIndex];

            this.getWalletData();
            this.props.changeHomeScreenRoute('balance');
            this.props.navigator.push({
                screen: 'loading',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                },
                animated: false,
                overrideBackPress: true,
            });
            this.props.getCurrencyData(this.props.settings.currency);
            if (this.props.account.firstUse) {
                this.props.getAccountInfoNewSeed(value, seedName, (error, success) => {
                    if (error) {
                        this.onNodeError();
                    } else {
                        this.props.setReady();
                    }
                });
            } else {
                const accountInfo = this.props.account.accountInfo;
                this.props.getAccountInfo(seedName, seedIndex, accountInfo, (error, success) => {
                    if (error) {
                        this.onNodeError();
                    } else {
                        this.props.setReady();
                    }
                });
            }
        };
    }

    onNodeError() {
        this.props.navigator.pop({
            animated: false,
        });
        this.dropdown.alertWithType('error', 'Invalid response', `The node returned an invalid response.`);
        this._showModal();
    }

    onUseSeedPress() {
        this.dropdown.alertWithType('error', 'This function is not available', 'It will be added at a later stage.');
        {
            /*this.props.navigator.push({
            screen: 'useSeed',
            navigatorStyle: {
                navBarHidden: true,
            },
            animated: false,
            overrideBackPress: true
        });*/
        }
    }

    render() {
        let { password } = this.state;
        const { t } = this.props;
        return (
            <ImageBackground source={require('../../shared/images/bg-blue.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                {!this.state.changingNode && (
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View>
                            <View style={styles.topContainer}>
                                <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                                <View style={styles.titleContainer}>
                                    <Text style={styles.title}>Please enter your password.</Text>
                                </View>
                            </View>
                            <View style={styles.midContainer}>
                                <TextField
                                    style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                    labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                    labelFontSize={width / 31.8}
                                    fontSize={width / 20.7}
                                    labelPadding={3}
                                    baseColor="white"
                                    label="Password"
                                    tintColor="#F7D002"
                                    autoCapitalize={'none'}
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically={true}
                                    returnKeyType="done"
                                    value={password}
                                    onChangeText={password => this.setState({ password })}
                                    containerStyle={{
                                        width: width / 1.4,
                                    }}
                                    secureTextEntry={true}
                                />
                            </View>
                            <View style={styles.bottomContainer}>
                                <OnboardingButtons
                                    onLeftButtonPress={() => this.onUseSeedPress()}
                                    onRightButtonPress={() => this.onLoginPress()}
                                    leftText={'USE SEED'}
                                    rightText={'LOG IN'}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                )}
                {this.state.changingNode && (
                    <View>
                        <View style={{ flex: 0.8 }} />
                        <View style={{ flex: 4.62 }}>
                            <NodeSelection
                                setNode={selectedNode => {
                                    changeIotaNode(selectedNode);
                                    this.props.setFullNode(selectedNode);
                                }}
                                node={this.props.settings.fullNode}
                                nodes={this.props.settings.availableNodes}
                                backPress={() => this.setState({ changingNode: false })}
                            />
                        </View>
                        <View style={{ flex: 0.2 }} />
                    </View>
                )}
                <DropdownAlert
                    ref={ref => (this.dropdown = ref)}
                    successColor="#009f3f"
                    errorColor="#A10702"
                    titleStyle={styles.dropdownTitle}
                    defaultTextContainer={styles.dropdownTextContainer}
                    messageStyle={styles.dropdownMessage}
                    imageStyle={styles.dropdownImage}
                    inactiveStatusBarStyle={StatusBarDefaultBarStyle}
                    closeInterval={6000}
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
        backgroundColor: '#102e36',
    },
    topContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4.8,
        alignItems: 'center',
        paddingTop: height / 4.2,
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
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
    greetingText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        paddingHorizontal: width / 7,
        paddingBottom: height / 10,
        backgroundColor: 'transparent',
    },
    questionText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.25,
        textAlign: 'center',
        paddingLeft: width / 7,
        paddingRight: width / 7,
        paddingTop: height / 25,
        backgroundColor: 'transparent',
    },
    newSeedButton: {
        borderColor: '#F7D002',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 1.65,
        height: height / 17,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginRight: width / 10,
    },
    newSeedText: {
        color: '#F7D002',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
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
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: height / 18,
        width: width / 1.15,
    },
    questionText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        paddingBottom: height / 16,
    },
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    account: state.account,
    marketData: state.marketData,
    settings: state.settings,
});

const mapDispatchToProps = dispatch => ({
    setPassword: password => {
        dispatch(setPassword(password));
    },
    getAccountInfo: (seedName, seedIndex, accountInfo, cb) => {
        dispatch(getAccountInfo(seedName, seedIndex, accountInfo, cb));
    },
    getAccountInfoNewSeed: (seed, seedName, cb) => {
        dispatch(getAccountInfoNewSeed(seed, seedName, cb));
    },
    changeHomeScreenRoute: tab => {
        dispatch(changeHomeScreenRoute(tab));
    },
    getMarketData: () => {
        dispatch(getMarketData());
    },
    getPrice: () => {
        dispatch(getPrice());
    },
    getChartData: () => {
        dispatch(getChartData());
    },
    clearTempData: () => dispatch(clearTempData()),
    getCurrencyData: currency => dispatch(getCurrencyData(currency)),
    setReady: () => dispatch(setReady()),
    setFullNode: node => dispatch(setFullNode(node)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
