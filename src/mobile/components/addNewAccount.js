import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { width, height } from '../util/dimensions';
import keyImagePath from 'iota-wallet-shared-modules/images/key.png';
import addImagePath from 'iota-wallet-shared-modules/images/add.png';
import arrowLeftPath from 'iota-wallet-shared-modules/images/arrow-left.png';

class AddNewAccount extends Component {
    static propTypes = {
        addExistingSeed: PropTypes.func.isRequired,
        addNewSeed: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
    };

    onNewSeedPress() {
        this.props.addNewSeed();
    }

    onExistingSeedPress() {
        this.props.addExistingSeed();
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{ flex: 9, justifyContent: 'flex-start' }}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.onExistingSeedPress()}>
                            <View style={styles.item}>
                                <Image source={keyImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>Use existing seed</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.onNewSeedPress()}>
                            <View style={styles.item}>
                                <Image source={addImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>Create new seed</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 7 }} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <TouchableOpacity onPress={event => this.props.backPress()}>
                        <View style={styles.item}>
                            <Image source={arrowLeftPath} style={styles.icon} />
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
        width,
        paddingHorizontal: width / 15,
    },
    icon: {
        width: width / 22,
        height: width / 22,
        marginRight: width / 25,
    },
    itemContainer: {
        flex: 1,
        justifyContent: 'center',
    },
});

export default AddNewAccount;
