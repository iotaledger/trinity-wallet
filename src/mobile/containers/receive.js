import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    View,
    Text,
    Image,
    ListView,
    Dimensions,
    TouchableOpacity,
    Clipboard,
} from 'react-native';
import QRCode from 'react-native-qrcode';
import { connect } from 'react-redux';
import { generateNewAddress } from '../../shared/actions/iotaActions';
import { getFromKeychain } from '../../shared/libs/cryptography';
import TransactionRow from '../components/transactionRow';

const { height, width } = Dimensions.get('window');

class Receive extends React.Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: ds.cloneWithRows([]),
            animating: false,
        };
    }

    shouldComponentUpdate() {
        if (!this.props.iota.addresses == []) {
            this.setState({ animating: false });
        }
        return true;
    }

    onGeneratePress(props) {
        getFromKeychain(this.props.iota.password, seed => {
            if (typeof seed !== 'undefined') {
                this.setState({ animating: true });
                generate(seed);
            } else {
                error();
            }
        });
        function generate(seed) {
            props.generateNewAddress(seed);
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
                <View style={{ paddingTop: height / 20, flex: 1 }}>
                    <ActivityIndicator
                        animating={this.state.animating}
                        style={styles.activityIndicator}
                        size="large"
                        color="#F7D002"
                    />
                </View>
                <View style={{ paddingTop: height / 20 }}>
                    <ListView
                        enableEmptySections={true}
                        dataSource={this.state.dataSource}
                        renderRow={data => <TransactionRow rowData={data} />}
                        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                    />
                </View>
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
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80,
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
