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

    onLogOutClick() {
        this.props.clearIOTA();
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    screenBackgroundImageName: 'bg-green.png',
                    screenBackgroundColor: '#102e36'
                }
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <TouchableOpacity onPress={event => this.onLogOutClick()}>
                    <View style={styles.logOutButton}>
                        <Text style={styles.logOutText}>LOG OUT</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height / 20
    },
    logOutButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.5,
        borderRadius: 10,
        width: width * 0.6,
        height: height * 0.06,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    logOutText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        backgroundColor: 'transparent'
    }
});

const mapDispatchToProps = dispatch => ({
    clearIOTA: () => {
        dispatch(clearIOTA());
    }
});

const mapStateToProps = state => ({
    account: state.account
});

export default connect(mapStateToProps, mapDispatchToProps)(Tools);
