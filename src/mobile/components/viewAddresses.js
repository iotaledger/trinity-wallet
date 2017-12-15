import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, ListView, Clipboard } from 'react-native';
import { formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
import { width, height } from '../util/dimensions';
import DropdownHolder from '../components/dropdownHolder';
import arrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left.png';

class ViewAddresses extends Component {
    copy(address) {
        const dropdown = DropdownHolder.getDropdown();
        Clipboard.setString(address);
        if (dropdown) {
            // Just to be sure
            dropdown.alertWithType('success', 'Address copied', 'The address has been copied to the clipboard.');
        }
    }

    render() {
        let addressData = Object.entries(this.props.addressData);
        addressData = addressData.reverse();
        return (
            <View style={styles.container}>
                <View style={styles.listView}>
                    <ListView
                        dataSource={ds.cloneWithRows(addressData)}
                        renderRow={(rowData, sectionID, rowID) => (
                            <View style={{ flexDirection: 'row', paddingHorizontal: width / 15 }}>
                                <TouchableOpacity
                                    onPress={() => this.copy(rowID)}
                                    style={{ alignItems: 'flex-start', flex: 8, justifyContent: 'center' }}
                                >
                                    <View>
                                        <Text
                                            numberOfLines={2}
                                            style={[
                                                styles.addressText,
                                                { textDecorationLine: rowData[1].spent ? 'line-through' : 'none' },
                                            ]}
                                        >
                                            {rowData[0]}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                <View style={{ alignItems: 'flex-end', flex: 2, justifyContent: 'center' }}>
                                    <Text style={styles.balanceText}>
                                        {formatValue(rowData[1].balance)} {formatUnit(rowData[1].balance)}
                                    </Text>
                                </View>
                            </View>
                        )}
                        contentContainerView={{ flex: 1 }}
                        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                        enableEmptySections
                    />
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={event => this.props.backPress()} style={{ flex: 1 }}>
                        <View style={styles.itemLeft}>
                            <Image source={arrowLeftImagePath} style={styles.icon} />
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
    bottomContainer: {
        flex: 1,
        width: width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addressText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 29.6,
        textDecorationStyle: 'solid',
        color: 'white',
    },
    balanceText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        textAlign: 'right',
    },
    listView: {
        flex: 9,
        justifyContent: 'center',
        width: width,
    },
    separator: {
        flex: 1,
        height: height / 60,
    },
});

export default ViewAddresses;
