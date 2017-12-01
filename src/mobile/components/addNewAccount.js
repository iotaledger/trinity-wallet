import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { connect } from 'react-redux';

const width = Dimensions.get('window').width;
const height = global.height;

class AddNewAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    onNewSeedPress() {
        this.props.addNewSeed();
    }

    onExistingSeedPress() {
        this.props.addExistingSeed();
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{ flex: 4, justifyContent: 'flex-start' }}>
                    <TouchableOpacity onPress={event => this.onExistingSeedPress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/key.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Use existing seed</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={event => this.onNewSeedPress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/add.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Create new seed</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 0.5, justifyContent: 'flex-end' }}>
                    <TouchableOpacity onPress={event => this.props.backPress()}>
                        <View style={styles.item}>
                            <Image source={require('../../shared/images/arrow-left.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Back</Text>
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
        alignItems: 'stretch',
        justifyContent: 'space-between',
    },
    titleText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
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
});

export default AddNewAccount;
