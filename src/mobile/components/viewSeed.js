import React, { Component } from 'react';
import {
    Image,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Keyboard,
    TouchableWithoutFeedback,
    AppState,
} from 'react-native';
import Fonts from '../theme/Fonts';
import Seedbox from '../components/seedBox.js';
import { TextField } from 'react-native-material-textfield';
import { getFromKeychain, getSeed } from 'iota-wallet-shared-modules/libs/cryptography';
import { width, height } from '../util/dimensions';

class ViewSeed extends React.Component {
    constructor() {
        super();
        this.state = {
            password: '',
            showSeed: false,
            seed: '',
            appState: AppState.currentState,
        };
    }

    componentWillReceiveProps(newProps) {
        if (this.props.seedIndex != newProps.seedIndex) {
            this.hideSeed();
        }
    }

    viewSeed() {
        if (this.state.password == this.props.password) {
            getFromKeychain(this.state.password, value => {
                if (typeof value != 'undefined' && value != null) {
                    const seed = getSeed(value, this.props.seedIndex);
                    this.setState({ seed: seed });
                    this.setState({ showSeed: true });
                } else {
                    error();
                }
            });
        } else {
            this.props.onWrongPassword();
        }
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = nextAppState => {
        if (nextAppState.match(/inactive|background/)) {
            this.hideSeed();
        }
        this.setState({ appState: nextAppState });
    };

    hideSeed() {
        this.setState({
            seed: '',
            showSeed: false,
            password: '',
        });
    }

    render() {
        const { t } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        {!this.state.showSeed && (
                            <View style={styles.passwordTextContainer}>
                                <Text style={styles.generalText}>Enter password to view your seed.</Text>
                            </View>
                        )}
                        {!this.state.showSeed && (
                            <View style={styles.textFieldContainer}>
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
                                    value={this.state.password}
                                    onChangeText={password => this.setState({ password })}
                                    containerStyle={{
                                        width: width / 1.4,
                                    }}
                                    secureTextEntry={true}
                                />
                            </View>
                        )}
                        {this.state.password.length > 0 &&
                            !this.state.showSeed && (
                                <View style={styles.viewButtonContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.viewSeed();
                                        }}
                                    >
                                        <View style={styles.viewButton}>
                                            <Text style={styles.viewText}>VIEW SEED</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}

                        {this.state.password.length == 0 && <View style={styles.viewButtonContainer} />}

                        {this.state.showSeed && (
                            <View style={{ flex: 1 }}>
                                <View style={styles.seedBoxContainer}>
                                    <Seedbox seed={this.state.seed} />
                                </View>
                                <View style={styles.hideButtonContainer}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.hideSeed();
                                        }}
                                    >
                                        <View style={styles.viewButton}>
                                            <Text style={styles.viewText}>HIDE SEED</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={event => this.props.backPress()}>
                            <View style={styles.item}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/arrow-left.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    generalText: {
        color: 'white',
        fontFamily: Fonts.secondary,
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    topContainer: {
        flex: 9,
        justifyContent: 'space-around',
    },
    passwordTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    textFieldContainer: {
        flex: 2,
        justifyContent: 'flex-start',
        paddingTop: height / 20,
    },
    viewButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    seedBoxContainer: {
        flex: 3.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hideButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-start',
        width: width,
        paddingHorizontal: width / 15,
    },
    icon: {
        width: width / 22,
        height: width / 22,
        marginRight: width / 25,
    },
    titleText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    viewButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: 8,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    viewText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
});

export default ViewSeed;
