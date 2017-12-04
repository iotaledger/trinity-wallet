import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, ListView } from 'react-native';
import Fonts from '../theme/Fonts';
import { formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
import { width, height } from 'iota-wallet-shared-modules/libs/dimensions';

class ViewAddresses extends React.Component {
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.listView}>
                    <ListView
                        dataSource={ds.cloneWithRows(this.props.addressesWithBalance)}
                        renderRow={(rowData, sectionID, rowID) => (
                            <View style={{ flexDirection: 'row', paddingHorizontal: width / 15 }}>
                                <View style={{ alignItems: 'flex-start', flex: 8, justifyContent: 'center' }}>
                                    <Text numberOfLines={2} style={styles.addressText}>
                                        {rowID}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'flex-end', flex: 2, justifyContent: 'center' }}>
                                    <Text style={styles.balanceText}>
                                        {formatValue(rowData)} {formatUnit(rowData)}
                                    </Text>
                                </View>
                            </View>
                        )}
                        contentContainerView={{ flex: 1 }}
                        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                        enableEmptySections
                        ref={listview => {
                            this.listview = listview;
                        }}
                    />
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={event => this.props.backPress()} style={{ flex: 1 }}>
                        <View style={styles.itemLeft}>
                            <Image
                                source={require('iota-wallet-shared-modules/images/arrow-left.png')}
                                style={styles.icon}
                            />
                            <Text style={styles.titleText}>Back</Text>
                        </View>
                    </TouchableOpacity>
                    {/*}<TouchableOpacity onPress={event => this.props.printPress()} style={{flex:1}}>
                        <View style={styles.itemRight}>
                            <Image source={require('iota-wallet-shared-modules/images/print.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Print</Text>
                        </View>
                    </TouchableOpacity>*/}
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
        flex: 0.5,
        width: width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    addressText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 29.6,
    },
    balanceText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        textAlign: 'right',
    },
    listView: {
        flex: 3,
        justifyContent: 'center',
        width: width,
    },
    separator: {
        flex: 1,
        height: height / 60,
    },
});

export default ViewAddresses;
