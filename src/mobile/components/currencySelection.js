import React, { Component } from 'react';
import {
    Image,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ListView,
    LayoutAnimation,
    TouchableWithoutFeedback,
} from 'react-native';
import Fonts from '../theme/Fonts';
import { TextField } from 'react-native-material-textfield';
import Triangle from 'react-native-triangle';

const width = Dimensions.get('window').width;
const height = global.height;
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const CustomLayoutSpring = {
    duration: 100,
    create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleXY,
        springDamping: 0.7,
    },
    update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
    },
};

class CurrencySelection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            triangleDirection: 'down',
            dropdownHeight: 0,
            selectedCurrency: this.props.currency,
        };
    }

    saveCurrencySelection() {
        this.props.backPress();
        this.props.setCurrencySetting(this.state.selectedCurrency);
        this.props.getCurrencyData(this.state.selectedCurrency);
    }

    onDropdownItemPress(item) {
        this.setState({
            dropdownHeight: 0,
            triangleDirection: 'down',
            selectedCurrency: item,
        });
    }

    onDropdownTitlePress() {
        LayoutAnimation.configureNext(CustomLayoutSpring);
        switch (this.state.triangleDirection) {
            case 'down':
                this.setState({
                    triangleDirection: 'up',
                    dropdownHeight: height / 3.2,
                });
                break;
            case 'up':
                this.setState({
                    triangleDirection: 'down',
                    dropdownHeight: 0,
                });
                break;
        }
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={() => this.setState({ dropdownHeight: 0 })}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 1 }} />
                        <View style={{ justifyContent: 'flex-start', flex: 2 }}>
                            <Text style={styles.dropdownTitle}>Currency</Text>
                            <View style={styles.dropdownButtonContainer}>
                                <TouchableWithoutFeedback onPress={event => this.onDropdownTitlePress()}>
                                    <View style={styles.dropdownButton}>
                                        <Text numberOfLines={1} style={styles.currencySelected}>
                                            {this.state.selectedCurrency}
                                        </Text>
                                        <Triangle
                                            width={10}
                                            height={10}
                                            color={'white'}
                                            direction={this.state.triangleDirection}
                                            style={{ marginBottom: height / 80 }}
                                        />
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <View
                                style={{
                                    height: this.state.dropdownHeight,
                                    width: width / 3,
                                    overflow: 'hidden',
                                    backgroundColor: 'transparent',
                                    alignItems: 'flex-start',
                                    justifyContent: 'flex-start',
                                }}
                            >
                                <ListView
                                    dataSource={ds.cloneWithRows(this.props.currencies)}
                                    renderRow={(rowData, sectionID, rowID) => (
                                        <TouchableOpacity
                                            onPress={event => this.onDropdownItemPress(rowData)}
                                            style={{ alignItems: 'flex-start', flex: 1 }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    height: height / 22.4,
                                                    alignItems: 'stretch',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Text numberOfLines={1} style={styles.dropdownItem}>
                                                    {' '}
                                                    {rowData}{' '}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                    contentContainerView={{ flex: 1, justifyContent: 'flex-start' }}
                                    //renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                                    enableEmptySections
                                    snapToInterval={height / 22.4}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={event => this.props.backPress()}>
                            <View style={styles.itemLeft}>
                                <Image source={require('../../shared/images/arrow-left.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.saveCurrencySelection()}>
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
        paddingTop: height / 10,
    },
    saveButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: 8,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
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
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        width: width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    topContainer: {
        flex: 4.5,
        justifyContent: 'flex-start',
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
    dropdownTitle: {
        color: '#F7D002',
        fontFamily: 'Lato-Regular',
        fontSize: width / 33,
        backgroundColor: 'transparent',
    },
    dropdownItem: {
        color: 'white',
        fontSize: width / 23,
        fontFamily: 'Lato-Light',
        backgroundColor: 'transparent',
        paddingTop: height / 100,
        width: width / 3,
    },
    dropdownButtonContainer: {
        marginTop: height / 150,
    },
    currencySelected: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingBottom: height / 150,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderBottomColor: 'white',
        borderBottomWidth: 0.7,
        width: width / 3,
        height: height / 22,
    },
    separator: {
        flex: 1,
        height: height / 60,
    },
});

export default CurrencySelection;
