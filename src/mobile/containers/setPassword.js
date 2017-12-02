import React from 'react';
import { translate } from 'react-i18next';
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
import { connect } from 'react-redux';
import { increaseSeedCount, addAccountName, setOnboardingComplete } from 'iota-wallet-shared-modules/actions/account';
import { clearTempData, clearSeed } from 'iota-wallet-shared-modules/actions/tempAccount';
import { storeSeedInKeychain, checkKeychainForDuplicates } from 'iota-wallet-shared-modules/libs/cryptography';
import { TextField } from 'react-native-material-textfield';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import { Keyboard } from 'react-native';
import OnboardingButtons from '../components/onboardingButtons.js';

const width = Dimensions.get('window').width;
const height = global.height;
const MIN_PASSWORD_LENGTH = 12;
const StatusBarDefaultBarStyle = 'light-content';

class SetPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            reentry: '',
        };
    }

    onDonePress() {
        if (this.state.password.length >= MIN_PASSWORD_LENGTH && this.state.password == this.state.reentry) {
            checkKeychainForDuplicates(
                this.state.password,
                this.props.tempAccount.seed,
                this.props.tempAccount.seedName,
                (type, title, message) => dropdown.alertWithType(type, title, message),
                () =>
                    ifNoKeychainDuplicates(
                        this.state.password,
                        this.props.tempAccount.seed,
                        this.props.tempAccount.seedName,
                    ),
            );
            ifNoKeychainDuplicates = (password, seed, accountName) => {
                storeSeedInKeychain(password, seed, accountName), this.props.addAccountName(accountName);
                this.props.increaseSeedCount();
                this.props.clearTempData();
                this.props.clearSeed();
                this.props.setOnboardingComplete(true);
                this.props.navigator.push({
                    screen: 'onboardingComplete',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                    },
                    animated: false,
                    overrideBackPress: true,
                });
            };
        } else {
            if (this.state.password.length < MIN_PASSWORD_LENGTH || this.state.reentry.length < MIN_PASSWORD_LENGTH) {
                this.dropdown.alertWithType(
                    'error',
                    t('passwordTooShort'),
                    t('passwordTooShortExplanation', {
                        minLength: MIN_PASSWORD_LENGTH,
                        currentLength: this.state.password.length,
                    }),
                );
            } else if (!(this.state.password === this.state.reentry)) {
                this.dropdown.alertWithType('error', t('passwordMismatch'), t('passwordMismatchExplanation'));
            }
        }
    }
    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    render() {
        let { password, reentry } = this.state;
        const { t } = this.props;

        return (
            <ImageBackground source={require('iota-wallet-shared-modules/images/bg-blue.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topContainer}>
                            <Image
                                source={require('iota-wallet-shared-modules/images/iota-glow.png')}
                                style={styles.iotaLogo}
                            />
                            <View style={styles.titleContainer}>
                                <Text style={styles.greetingText}>{t('nowWeNeedTo')}</Text>
                            </View>
                        </View>
                        <View style={styles.midContainer}>
                            <View style={styles.infoTextContainer}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/info.png')}
                                    style={styles.infoIcon}
                                />
                                <Text style={styles.infoText}>{t('anEncryptedCopy')}</Text>
                                <Text style={styles.warningText}>{t('ensure')}</Text>
                            </View>
                            <TextField
                                style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={width / 31.8}
                                fontSize={width / 20.7}
                                labelPadding={3}
                                baseColor="white"
                                label={t('global:password')}
                                tintColor="#F7D002"
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically={true}
                                returnKeyType="next"
                                value={password}
                                onChangeText={password => this.setState({ password })}
                                onSubmitEditing={() => this.refs.reentry.focus()}
                                containerStyle={{
                                    width: width / 1.36,
                                }}
                                secureTextEntry={true}
                            />
                            <TextField
                                ref="reentry"
                                style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={width / 31.8}
                                fontSize={width / 20.7}
                                labelPadding={3}
                                baseColor="white"
                                label={t('retypePassword')}
                                tintColor="#F7D002"
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically={true}
                                returnKeyType="done"
                                value={reentry}
                                onChangeText={reentry => this.setState({ reentry })}
                                containerStyle={{ width: width / 1.36 }}
                                secureTextEntry={true}
                                onSubmitEditing={() => this.onDonePress()}
                            />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={() => this.onBackPress()}
                                onRightButtonPress={() => this.onDonePress()}
                                leftText={t('global:back')}
                                rightText={t('global:done')}
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
        paddingTop: height / 10,
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
        width: width / 1.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 30,
        borderStyle: 'dotted',
        paddingVertical: height / 60,
        marginTop: height / 25,
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
});

const mapDispatchToProps = dispatch => ({
    setOnboardingComplete: boolean => {
        dispatch(setOnboardingComplete(boolean));
    },
    storeSeedInKeychain: password => {
        dispatch(storeSeedInKeychain(password));
    },
    clearTempData: () => {
        dispatch(clearTempData());
    },
    clearSeed: () => {
        dispatch(clearSeed());
    },
    increaseSeedCount: () => {
        dispatch(increaseSeedCount());
    },
    addAccountName: newSeed => {
        dispatch(addAccountName(newSeed));
    },
});

export default translate(['setPassword', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SetPassword));
