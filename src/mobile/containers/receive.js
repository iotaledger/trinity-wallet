import isUndefined from 'lodash/isUndefined';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
    StatusBar,
} from 'react-native';
import QRCode from 'react-native-qrcode';
import { connect } from 'react-redux';
import { generateNewAddress, setReceiveAddress } from '../../shared/actions/tempAccount';
import { getFromKeychain, getSeed } from '../../shared/libs/cryptography';
import TransactionRow from '../components/transactionRow';
import DropdownAlert from 'react-native-dropdownalert';

const { height, width } = Dimensions.get('window');
const StatusBarDefaultBarStyle = 'light-content';

class Receive extends Component {
    constructor() {
        super();

        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.state = {
            dataSource: ds.cloneWithRows([]),
        };

        this.onGeneratePress = this.onGeneratePress.bind(this);
    }

    componentWillUnmount() {
        this.resetAddress();
    }

    resetAddress() {
        const { tempAccount: { receiveAddress } } = this.props;
        if (receiveAddress) {
            this.props.setReceiveAddress('');
        }
    }

    onGeneratePress() {
        getFromKeychain(this.props.tempAccount.password, value => {
            if (!isUndefined(value)) {
                var seed = getSeed(value, this.props.tempAccount.seedIndex);
                generate(seed);
            } else {
                error();
            }
        });

        const generate = seed => this.props.generateNewAddress(seed);

        const error = () => this.dropdown.alertWithType('error', 'Something went wrong', 'Please restart the app.');
    }

    onAddressPress(address) {
        if (address) {
            Clipboard.setString(address);
        }
    }

    render() {
        const { tempAccount: { receiveAddress, isGeneratingReceiveAddress } } = this.props;

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={{ paddingBottom: height / 40 }}>
                    <TouchableOpacity onPress={() => this.onAddressPress(receiveAddress)}>
                        <View style={styles.receiveAddressContainer}>
                            <Text style={styles.receiveAddressText}>{receiveAddress}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingBottom: height / 40 }}>
                    <QRCode value={receiveAddress} size={width / 2.5} bgColor="#000" fgColor="#FFF" />
                </View>
                {!receiveAddress && (
                    <TouchableOpacity
                        onPress={() => {
                            // Check if there's already a network call in progress.
                            if (!isGeneratingReceiveAddress) {
                                this.onGeneratePress();
                            }
                        }}
                    >
                        <View style={styles.generateButton}>
                            <Image style={styles.generateImage} source={require('../../shared/images/plus.png')} />
                            <Text style={styles.generateText}>GENERATE NEW ADDRESS</Text>
                        </View>
                    </TouchableOpacity>
                )}
                <View style={{ paddingTop: height / 20, flex: 1 }}>
                    <ActivityIndicator
                        animating={isGeneratingReceiveAddress}
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
                <DropdownAlert
                    ref={ref => (this.dropdown = ref)}
                    successColor="#009f3f"
                    errorColor="#A10702"
                    titleStyle={styles.dropdownTitle}
                    defaultTextContainer={styles.dropdownTextContainer}
                    messageStyle={styles.dropdownMessage}
                    imageStyle={styles.dropdownImage}
                    inactiveStatusBarStyle={StatusBarDefaultBarStyle}
                />
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
    tempAccount: state.tempAccount,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    generateNewAddress: seed => dispatch(generateNewAddress(seed)),
    setReceiveAddress: payload => dispatch(setReceiveAddress(payload)),
});

Receive.propTypes = {
    marketData: PropTypes.object.isRequired,
    tempAccount: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    generateNewAddress: PropTypes.func.isRequired,
    setReceiveAddress: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Receive);
