import React, { Component } from 'react';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { width, height } from '../util/dimensions';
import nodeImagePath from 'iota-wallet-shared-modules/images/node.png';
import syncImagePath from 'iota-wallet-shared-modules/images/sync.png';
import crossImagePath from 'iota-wallet-shared-modules/images/cross.png';
import addImagePath from 'iota-wallet-shared-modules/images/add.png';
import arrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left.png';

class AdvancedSettings extends React.Component {
    render() {
        const { t } = this.props;
        return (
            <View style={styles.container}>
                <View style={{ flex: 4.5 }}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.props.setSetting('nodeSelection')}>
                            <View style={styles.item}>
                                <Image source={nodeImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>Select node</Text>
                                <Text numberOfLines={1} style={styles.settingText}>
                                    {this.props.node}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.props.setSetting('addCustomNode')}>
                            <View style={styles.item}>
                                <Image source={addImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>Add custom node</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.props.setSetting('manualSync')}>
                            <View style={styles.item}>
                                <Image source={syncImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>Manual sync</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.separatorContainer}>
                        <View style={styles.separator} />
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.props.onResetWalletPress()}>
                            <View style={styles.item}>
                                <Image source={crossImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>Reset wallet</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 5.5, justifyContent: 'flex-end' }}>
                    <View style={{ flex: 4.5 }} />
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.props.setSetting('mainSettings')}>
                            <View style={styles.item}>
                                <Image source={arrowLeftImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topContainer: {
        flex: 10,
        justifyContent: 'flex-end',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    itemContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
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
    separator: {
        borderBottomColor: 'white',
        borderBottomWidth: height / 1500,
        width: width / 1.16,
        alignSelf: 'center',
    },
    separatorContainer: {
        flex: 0.5,
        justifyContent: 'center',
    },
    settingText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        marginLeft: width / 12,
        width: width / 2.4,
        backgroundColor: 'transparent',
    },
});

export default AdvancedSettings;
