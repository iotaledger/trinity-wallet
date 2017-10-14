import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import { clearIOTA } from '../../shared/actions/iotaActions';
import store from '../../shared/store';
import { persistStore } from 'redux-persist';

const { height, width } = Dimensions.get('window');

class Tools extends React.Component {
    constructor(props) {
        super(props);
    }

    onLogoutPress() {
        this.props.clearIOTA();
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    screenBackgroundImageName: 'bg-green.png',
                    screenBackgroundColor: '#102e36',
                },
            },
        });
    }

    onChangePasswordPress() {}

    onChangeLanguagePress() {}

    onSetNodePress() {}

    on2FASetupPress() {}

    onAddNewSeedPress() {}

    onResetWalletPress() {}

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.modulesContainer} />
                <View style={styles.modeButtonContainer}>
                    <View style={styles.modeButton} />
                </View>
                <View style={styles.toolButtonsContainer}>
                    <View style={styles.leftToolButtons}>
                        <TouchableOpacity onPress={event => this.onChangePasswordPress()}>
                            <View style={styles.toolButton}>
                                <Text style={styles.toolButtonText}>CHANGE PASSWORD</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={event => this.onChangeLanguagePress()}>
                            <View style={styles.toolButton}>
                                <Text style={styles.toolButtonText}>CHANGE LANGUAGE</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={event => this.onSetNodePress()}>
                            <View style={styles.toolButton}>
                                <Text style={styles.toolButtonText}>SET NODE</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <TouchableOpacity onPress={event => this.on2FASetupPress()}>
                            <View style={styles.toolButton}>
                                <Text style={styles.toolButtonText}>2FA SETUP</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={event => this.onAddNewSeedPress()}>
                            <View style={styles.toolButton}>
                                <Text style={styles.toolButtonText}>ADD NEW SEED</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={event => this.onResetWalletPress()}>
                            <View style={styles.toolButton}>
                                <Text style={styles.toolButtonText}>RESET WALLET</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.logoutButtonContainer}>
                    <TouchableOpacity onPress={event => this.onLogoutPress()}>
                        <View style={styles.logoutButton}>
                            <Text style={styles.logoutText}>LOG OUT</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height / 40,
    },
    logoutButtonContainer: {
        flex: 0.7,
        alignItems: 'center',
    },
    logoutButton: {
        borderColor: '#F7D002',
        borderWidth: 1.5,
        borderRadius: 10,
        width: width * 0.6,
        height: height * 0.06,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        color: '#F7D002',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        backgroundColor: 'transparent',
    },
    toolButtonText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.3,
        backgroundColor: 'transparent',
    },
    toolButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.5,
        borderRadius: 10,
        width: width / 2.3,
        height: height / 19,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 50,
    },
    leftToolButtons: {
        paddingRight: width / 30,
    },
    toolButtonsContainer: {
        flex: 3,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingBottom: height / 50,
        alignItems: 'center',
    },
    modeButton: {},
    modeButtonContainer: {
        flex: 1.5,
    },
    modulesContainer: {
        flex: 4,
    },
});

const mapDispatchToProps = dispatch => ({
    clearIOTA: () => {
        dispatch(clearIOTA());
    },
});

const mapStateToProps = state => ({
    account: state.account,
});

export default connect(mapStateToProps, mapDispatchToProps)(Tools);
