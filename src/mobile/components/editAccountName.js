import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, Dimensions, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Fonts from '../theme/Fonts';
import { TextField } from 'react-native-material-textfield';

const width = Dimensions.get('window').width;
const height = global.height;

class EditAccountName extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            accountName: props.accountName
        }
    }

    componentWillReceiveProps(newProps){
        if(this.props.accountName != newProps.accountName){
            this.setState({ accountName: newProps.accountName });
        }
    }

    render() {
        return (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={styles.textFieldContainer}>
                          <TextField
                              style={{ color: 'white', fontFamily: 'Lato-Light' }}
                              labelTextStyle={{ fontFamily: 'Lato-Light' }}
                              labelFontSize={width / 31.8}
                              fontSize={width / 20.7}
                              labelPadding={3}
                              baseColor="white"
                              label="Account name"
                              tintColor="#F7D002"
                              autoCapitalize={'none'}
                              autoCorrect={false}
                              enablesReturnKeyAutomatically={true}
                              returnKeyType="done"
                              value={this.state.accountName}
                              onChangeText={accountName => this.setState({ accountName })}
                              containerStyle={{
                                  width: width / 1.4,
                              }}
                          />
                    </View>
                    <View style={styles.saveButtonContainer}>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={event => this.props.backPress()}>
                        <View style={styles.itemLeft}>
                            <Image source={require('../../shared/images/arrow-left.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Back</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.saveAccountName(this.state.accountName)}>
                        <View style={styles.itemRight}>
                            <Image source={require('../../shared/images/tick.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Save</Text>
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
    textFieldContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: height / 10
    },
    saveButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: 8,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    saveText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    saveButtonContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomContainer: {
        flex: 0.5,
        width: width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
    },
    topContainer: {
        flex: 4.5,
        justifyContent: 'space-around'
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-end',
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
  });

  export default EditAccountName;
