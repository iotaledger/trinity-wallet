import React, { Component } from 'react';
import {
    Image,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    TouchableWithoutFeedback,
} from 'react-native';
import Dropdown from './dropdown';

const { width } = Dimensions.get('window');
const height = global.height;

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
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
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

class CurrencySelection extends Component {
    saveCurrencySelection(currency) {
        const { backPress, setCurrencySetting, getCurrencyData } = this.props;

        backPress();
        setCurrencySetting(currency);
        getCurrencyData(currency);
    }

    render() {
        const { currency, currencies, backPress, saveCurrencySelection } = this.props;
        return (
            <TouchableWithoutFeedback onPress={() => this.dropdown.closeDropdown()}>
                <View style={styles.container}>
                    <Dropdown
                        ref={c => {
                            this.dropdown = c;
                        }}
                        title="Currency"
                        options={currencies}
                        defaultOption={currency}
                        saveSelection={option => this.saveCurrencySelection(option)}
                    />
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={() => backPress()}>
                            <View style={styles.itemLeft}>
                                <Image source={require('iota-wallet-shared-modules/images/arrow-left.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => saveCurrencySelection()}>
                            <View style={styles.itemRight}>
                                <Image source={require('iota-wallet-shared-modules/images/tick.png')} style={styles.icon} />
                                <Text style={styles.titleText}>Save</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default CurrencySelection;
