import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    ListView,
    Dimensions,
    TouchableOpacity,
    Clipboard,
    StatusBar,
} from 'react-native';
import QRCode from 'react-native-qrcode';
import { connect } from 'react-redux';
import { generateNewAddress } from '../../shared/actions/iotaActions';
import { getFromKeychain } from '../../shared/libs/cryptography';
import TransactionRow from '../components/transactionRow';
//import DropdownHolder from './dropdownHolder';

const { height, width } = Dimensions.get('window');
//const dropdown = DropdownHolder.getDropDown();

class Receive extends React.Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: ds.cloneWithRows([]),
        };
    }

    onGeneratePress(props) {
        getFromKeychain(this.props.iota.password, value => {
            if (typeof value !== 'undefined') {
                generate(value);
            } else {
                error();
            }
        });
        function generate(value) {
            props.generateNewAddress(value);
        }
        function error() {
            this.dropdown.alertWithType('error', 'Something went wrong', 'Please restart the app.');
        }
    }

    onAddressPress() {
        if (this.props.iota.addresses.length >= 1) {
            Clipboard.setString(this.props.iota.addresses[this.props.iota.addresses.length - 1]);
        } else {
            return;
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={{ paddingBottom: height / 40 }}>
                    <TouchableOpacity onPress={event => this.onAddressPress(this.props)}>
                        <View style={styles.receiveAddressContainer}>
                            <Text style={styles.receiveAddressText}>
                                {this.props.iota.addresses[this.props.iota.addresses.length - 1]}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingBottom: height / 40 }}>
                    <QRCode
                        value={this.props.iota.addresses[this.props.iota.addresses.length - 1]}
                        size={width / 2.5}
                        bgColor="#000"
                        fgColor="#FFF"
                    />
                </View>
                <TouchableOpacity onPress={event => this.onGeneratePress(this.props)}>
                    <View style={styles.generateButton}>
                        <Image style={styles.generateImage} source={require('../../shared/images/plus.png')} />
                        <Text style={styles.generateText}>GENERATE NEW ADDRESS</Text>
                    </View>
                </TouchableOpacity>
                <View style={{ paddingTop: height / 20 }}>
                    <ListView
                        enableEmptySections={true}
                        dataSource={this.state.dataSource}
                        renderRow={data => <TransactionRow rowData={data} />}
                        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                    />
                </View>
                // uncomment once dropdown issues are sorted out /*{' '}
                <DropdownAlert
                    ref={ref => (this.dropdown = ref)}
                    successColor="#009f3f"
                    errorColor="#A10702"
                    titleStyle={styles.dropdownTitle}
                    defaultTextContainer={styles.dropdownTextContainer}
                    messageStyle={styles.dropdownMessage}
                    imageStyle={styles.dropdownImage}
                    inactiveStatusBarStyle={StatusBar._defaultProps.barStyle.value}
                />{' '}
                */
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: height / 20,
    },
    receiveAddressContainer: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 8,
        width: width / 1.3,
        height: height / 10,
        justifyContent: 'center',
    },
    receiveAddressText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 33.7,
        color: 'white',
        backgroundColor: 'transparent',
        paddingHorizontal: width / 14,
        textAlign: 'center',
    },
    generateButton: {
        flexDirection: 'row',
        borderColor: 'rgba(255,255,255,0.6)',
        borderWidth: 1.5,
        borderRadius: 8,
        width: width / 2,
        height: height / 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#009f3f',
    },
    generateText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 40.5,
        backgroundColor: 'transparent',
        paddingLeft: 6,
    },
    generateImage: {
        height: width / 30,
        width: width / 30,
    },
    separator: {
        flex: 1,
        height: 15,
    },
    dropdownTitle: {
        fontSize: 16,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        padding: 15,
    },
    dropdownMessage: {
        fontSize: 14,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownImage: {
        padding: 8,
        width: 36,
        height: 36,
        alignSelf: 'center',
    },
});

const mapStateToProps = state => ({
    marketData: state.marketData,
    iota: state.iota,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    generateNewAddress: seed => {
        dispatch(generateNewAddress(seed));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Receive);
