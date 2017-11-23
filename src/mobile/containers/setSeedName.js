import merge from 'lodash/merge';
import React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
    Platform,
    ImageBackground,
    ScrollView,
    StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import { TextField } from 'react-native-material-textfield';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import { Keyboard } from 'react-native';
import OnboardingButtons from '../components/onboardingButtons.js';
import { storeInKeychain, getFromKeychain, removeLastSeed } from '../../shared/libs/cryptography';
import { getAccountInfoNewSeed, setFirstUse, increaseSeedCount, addSeedName } from '../../shared/actions/account';
import { generateAlert } from '../../shared/actions/alerts';
import { clearTempData, setSeedName, clearSeed } from '../../shared/actions/tempAccount';
const width = Dimensions.get('window').width;
const height = global.height;
const StatusBarDefaultBarStyle = 'light-content';

class SetSeedName extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            seedName: this.getDefaultSeedName(),
        };
    }

    getDefaultSeedName() {
        if (this.props.account.seedCount == 0) {
            return 'MAIN WALLET';
        } else if (this.props.account.seedCount == 1) {
            return 'SECOND WALLET';
        } else if (this.props.account.seedCount == 2) {
            return 'THIRD WALLET';
        } else if (this.props.account.seedCount == 3) {
            return 'FOURTH WALLET';
        } else if (this.props.account.seedCount == 4) {
            return 'FIFTH WALLET';
        } else if (this.props.account.seedCount == 5) {
            return 'SIXTH WALLET';
        } else if (this.props.account.seedCount == 6) {
            return 'OTHER WALLET';
        }
    }

    componentDidMount() {
        this.nameInput.focus();
    }

    onDonePress() {
        if (this.state.seedName != '') {
            if (!this.props.account.onboardingComplete) {
                this.props.increaseSeedCount();
                this.props.setSeedName(this.state.seedName);
                this.props.navigator.push({
                    screen: 'setPassword',
                    navigatorStyle: { navBarHidden: true, navBarTransparent: true },
                    animated: false,
                    overrideBackPress: true,
                });
            } else {
                this.props.clearTempData();
                storeInKeychain(
                    this.props.tempAccount.password,
                    this.props.tempAccount.seed,
                    this.state.seedName,
                    (type, title, message) => this.dropdown.alertWithType(type, title, message),
                    () => {
                        this.props.setFirstUse(true);
                        this.props.navigator.push({
                            screen: 'loading',
                            navigatorStyle: {
                                navBarHidden: true,
                                navBarTransparent: true,
                            },
                            animated: false,
                            overrideBackPress: true,
                        });
                        this.props.getAccountInfoNewSeed(
                            this.props.tempAccount.seed,
                            this.state.seedName,
                            (error, success) => {
                                if (error) {
                                    this.onNodeError();
                                } else {
                                    this.onNodeSuccess();
                                }
                            },
                        );
                    },
                );
            }
        } else {
            this.dropdown.alertWithType('error', 'No nickname entered', `Please enter a nickname for your seed.`);
        }
    }

    onNodeError() {
        getFromKeychain(this.props.tempAccount.password, value => {
            if (typeof value != 'undefined' && value != null) {
                removeLastSeed(value, this.props.tempAccount.password);
            } else {
                error();
            }
        });
        this.props.navigator.pop({
            animated: false,
        });
        this.dropdown.alertWithType('error', 'Invalid response', `The node returned an invalid response.`);
        this.props.setFirstUse(false);
    }

    onNodeSuccess() {
        this.props.increaseSeedCount();
        this.props.addSeedName(this.state.seedName);
        this.props.clearSeed();
    }

    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    render() {
        let { seedName } = this.state;

        return (
            <ImageBackground source={require('../../shared/images/bg-blue.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topContainer}>
                            <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                            <View style={styles.titleContainer}>
                                <Text style={styles.greetingText}>Enter a nickname for your seed.</Text>
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
                                label="Seed nickname"
                                tintColor="#F7D002"
                                autoCapitalize="characters"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically={true}
                                returnKeyType="done"
                                value={seedName}
                                onChangeText={seedName => this.setState({ seedName })}
                                containerStyle={{
                                    width: width / 1.36,
                                }}
                                ref={input => {
                                    this.nameInput = input;
                                }}
                            />
                            <View style={styles.infoTextContainer}>
                                <Image source={require('../../shared/images/info.png')} style={styles.infoIcon} />
                                <Text style={styles.infoText}>
                                    You can use multiple seeds with this wallet. Each seed requires a nickname.
                                </Text>
                                <Text style={styles.infoText}>You can add more seeds in the Settings menu.</Text>
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
        justifyContent: 'flex-start',
        paddingTop: height / 8,
        alignItems: 'center',
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
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextContainer: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 15,
        width: width / 1.6,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width / 30,
        borderStyle: 'dotted',
        paddingVertical: height / 60,
        marginTop: height / 15,
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
    greetingText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    questionText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        paddingHorizontal: width / 7,
        paddingTop: height / 25,
        backgroundColor: 'transparent',
    },
    infoIcon: {
        width: width / 20,
        height: width / 20,
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
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    increaseSeedCount: () => {
        dispatch(increaseSeedCount());
    },
    setSeedName: seedName => {
        dispatch(setSeedName(seedName));
    },
    clearSeed: () => {
        dispatch(clearSeed());
    },
    generateAlert: (error, title, message) => {
        dispatch(generateAlert(error, title, message));
    },
    setFirstUse: boolean => {
        dispatch(setFirstUse(boolean));
    },
    clearTempData: () => {
        dispatch(clearTempData());
    },
    addSeedName: newSeed => {
        dispatch(addSeedName(newSeed));
    },
    getAccountInfoNewSeed: (seed, seedName, cb) => {
        dispatch(getAccountInfoNewSeed(seed, seedName, cb));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(SetSeedName);
