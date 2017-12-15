import get from 'lodash/get';
import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    ScrollView,
    StatusBar,
    Keyboard,
} from 'react-native';
import { connect } from 'react-redux';
import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { getCurrencyData, setFullNode } from 'iota-wallet-shared-modules/actions/settings';
import { setPassword, clearTempData, setReady } from 'iota-wallet-shared-modules/actions/tempAccount';
import { getAccountInfo, getFullAccountInfo } from 'iota-wallet-shared-modules/actions/account';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import keychain, { getSeed } from '../util/keychain';
import { TextField } from 'react-native-material-textfield';
import OnboardingButtons from '../components/onboardingButtons.js';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import Modal from 'react-native-modal';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';
import NodeSelection from '../components/nodeSelection.js';
import COLORS from '../theme/Colors';

import blueBackgroundImagePath from 'iota-wallet-shared-modules/images/bg-blue.png';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
const StatusBarDefaultBarStyle = 'light-content';

import { width, height } from '../util/dimensions';

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
        <View style={{ width: width / 1.15, alignItems: 'center', backgroundColor: COLORS.backgroundGreen }}>
            <View style={styles.modalContent}>
                <Text style={styles.questionText}>Do you want to select a different node?</Text>
                <OnboardingButtons
                    onLeftButtonPress={() => this._hideModal()}
                    onRightButtonPress={() => this.navigateToNodeSelection()}
                    leftText={'NO'}
                    rightText={'YES'}
                />
            </View>
        </View>
    );

    getWalletData() {
        this.props.getChartData();
        this.props.getPrice();
        this.props.getMarketData();
    }

    onLoginPress() {
        const { t } = this.props;
        Keyboard.dismiss;
        if (!this.state.password) {
            this.dropdown.alertWithType(
                'error',
                'Empty password',
                'You must enter a password to log in. Please try again.',
            );
        } else {
            keychain
                .get()
                .then(credentials => {
                    this.props.setPassword(this.state.password);
                    if (get(credentials, 'data')) {
                        const seed = getSeed(credentials.data, 0);
                        login(seed);
                    } else {
                        error();
                    }
                })
                .catch(err => console.log(err)); // Dropdown
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
                this.props.getFullAccountInfo(value, seedName, (error, success) => {
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
        const { t } = this.props;
        this.props.navigator.pop({
            animated: false,
        });
        this.dropdown.alertWithType('error', 'Invalid response', `The node returned an invalid response.`);
        this._showModal();
    }

    onUseSeedPress() {
        const { t } = this.props;
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
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                {!this.state.changingNode && (
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View>
                            <View style={styles.topContainer}>
                                <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
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
                                    onSubmitEditing={() => this.onLoginPress()}
                                />
                            </View>
                            <View style={styles.bottomContainer}>
                                <TouchableOpacity onPress={event => this.onLoginPress()}>
                                    <View style={styles.loginButton}>
                                        <Text style={styles.loginText}>LOGIN</Text>
                                    </View>
                                </TouchableOpacity>
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
    loginButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    loginText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
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
    getFullAccountInfo: (seed, seedName, cb) => {
        dispatch(getFullAccountInfo(seed, seedName, cb));
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
