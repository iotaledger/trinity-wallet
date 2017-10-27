import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { connect } from 'react-redux';
import { storeInKeychain, getFromKeychain } from '../../shared/libs/cryptography';
import { increaseSeedCount, addSeed } from '../../shared/actions/accountActions';

const { height, width } = Dimensions.get('window');

class AddNewSeedModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            seed: '',
            seedName: '',
        };
    }
    onNewSeedPress() {
        storeInKeychain(this.props.iota.password, this.state.seed, this.state.seedName, () => {
            this.props.increaseSeedCount();
            this.props.addSeed(this.state.seedName);
        });

        {
            /*this.props.navigator.push({
            screen: 'newSeedSetup',
            navigatorStyle: {
                navBarHidden: true,
                screenBackgroundImageName: 'bg-green.png',
                screenBackgroundColor: '#102e36',
            },
            animated: false,
        });*/
        }
    }

    onExistingSeedPress() {
        getFromKeychain(this.props.iota.password, value => {
            if (typeof value !== 'undefined') {
                console.log(value);
            } else {
                error();
            }
        });
    }

    render() {
        const { seed, seedName } = this.state;
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={{ alignItems: 'center' }}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeIconButton} onPress={() => this.props.hideModal()}>
                        <Image style={styles.closeIcon} source={require('../../shared/images/cross.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={event => this.onNewSeedPress()}>
                        <View style={styles.newSeedButton}>
                            <Text style={styles.newSeedButtonText}>CREATE NEW SEED</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={event => this.onExistingSeedPress()}>
                        <View style={styles.existingSeedButton}>
                            <Text style={styles.existingSeedButtonText}>ADD EXISTING SEED</Text>
                        </View>
                    </TouchableOpacity>
                    <TextField
                        style={styles.textField}
                        labelTextStyle={{ fontFamily: 'Lato-Light' }}
                        labelFontSize={width / 31.8}
                        fontSize={width / 20.7}
                        labelPadding={3}
                        baseColor="white"
                        tintColor="#F7D002"
                        enablesReturnKeyAutomatically={true}
                        label="Seed"
                        autoCorrect={false}
                        value={seed}
                        maxLength={81}
                        onChangeText={seed => this.setState({ seed })}
                    />
                    <TextField
                        style={styles.textField}
                        labelTextStyle={{ fontFamily: 'Lato-Light' }}
                        labelFontSize={width / 31.8}
                        fontSize={width / 20.7}
                        labelPadding={3}
                        baseColor="white"
                        tintColor="#F7D002"
                        enablesReturnKeyAutomatically={true}
                        label="Seed name"
                        autoCorrect={false}
                        value={seedName}
                        onChangeText={seedName => this.setState({ seedName })}
                    />
                </View>
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    modalContent: {
        justifyContent: 'center',
        width: width / 1.4,
        height: height / 1.5,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    newSeedButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 2,
        height: height / 12,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: height / 60,
    },
    newSeedButtonText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    existingSeedButton: {
        borderColor: '#F7D002',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 2,
        height: height / 12,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: height / 30,
    },
    existingSeedButtonText: {
        color: '#F7D002',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    closeIcon: {
        width: width / 18,
        height: width / 18,
    },
    closeIconButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        margin: width / 40,
    },
    textField: {
        color: 'white',
        fontFamily: 'Inconsolata-Bold',
    },
});

const mapStateToProps = state => ({
    marketData: state.marketData,
    iota: state.iota,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    increaseSeedCount: () => {
        dispatch(increaseSeedCount());
    },
    addSeed: newSeed => {
        dispatch(addSeed(newSeed));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(AddNewSeedModal);
