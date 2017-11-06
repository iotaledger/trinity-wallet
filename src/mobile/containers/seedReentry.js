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
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import { Keyboard } from 'react-native';
import { connect } from 'react-redux';
import OnboardingButtons from '../components/onboardingButtons.js';
import { getFromKeychain, getSeed } from '../../shared/libs/cryptography';

//import DropdownHolder from './dropdownHolder';

const { height, width } = Dimensions.get('window');
const StatusBarDefaultBarStyle = 'light-content';
//const dropdown = DropdownHolder.getDropDown();

class SeedReentry extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            seed: '',
        };
    }

    onDonePress() {
        if (this.state.seed == this.props.iota.seed) {
            this.props.navigator.push({
                screen: 'setSeedName',
                navigatorStyle: { navBarHidden: true },
                animated: false,
            });
        } else {
            this.dropdown.alertWithType(
                'error',
                'Incorrect seed.',
                `The seed you entered is incorrect. Please try again.`,
            );
        }
    }

    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

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
                                <TextField
                                    style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                    labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                    labelFontSize={width / 31.8}
                                    fontSize={width / 20.7}
                                    labelPadding={3}
                                    baseColor="white"
                                    label="Seed"
                                    tintColor="#F7D002"
                                    autoCapitalize={'none'}
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically={true}
                                    returnKeyType="done"
                                    value={seed}
                                    onChangeText={seed => this.setState({ seed })}
                                    containerStyle={{
                                        width: width / 1.4,
                                    }}
                                    secureTextEntry={true}
                                />
                                <View style={styles.infoTextContainer}>
                                    <Image source={require('../../shared/images/info.png')} style={styles.infoIcon} />
                                    <Text style={styles.infoText}>
                                        This is a check to make sure you saved your seed.
                                    </Text>
                                    <Text style={styles.infoText}>
                                        If you have not saved your seed, please go back to the previous screen and do
                                        so.
                                    </Text>
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
        height: height / 4.2,
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
});

const mapStateToProps = state => ({
    marketData: state.marketData,
    iota: state.iota,
    account: state.account,
});

export default connect(mapStateToProps)(SeedReentry);
