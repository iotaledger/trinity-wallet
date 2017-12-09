import React, { Component } from 'react';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { width, height } from '../util/dimensions';

class AdvancedSettings extends React.Component {
    render() {
        const { t } = this.props;
        return (
            <View style={styles.advancedSettingsContainer}>
                <View style={{ flex: 5.5 }}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.props.setSetting('viewSeed')}>
                            <View style={styles.item}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/key.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>View seed</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.props.setSetting('viewAddresses')}>
                            <View style={styles.item}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/addresses.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>View addresses</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.props.setSetting('editAccountName')}>
                            <View style={styles.item}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/edit.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Edit account name</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.props.onDeleteAccountPress()}>
                            <View style={styles.item}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/delete.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Delete account</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.separatorContainer}>
                        <View style={styles.separator} />
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.props.setSetting('addNewAccount')}>
                            <View style={styles.item}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/add.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Add new account</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 4.5 }}>
                    <View style={{ flex: 3.5 }} />
                    <View style={styles.itemContainer}>
                        <TouchableOpacity onPress={event => this.props.setSetting('mainSettings')}>
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
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
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
        borderBottomWidth: 0.3,
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
