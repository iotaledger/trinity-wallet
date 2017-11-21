import isUndefined from 'lodash/isUndefined';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
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
import QRCode from 'react-native-qrcode-svg';
import { connect } from 'react-redux';
import {
    generateNewAddress,
    setReceiveAddress,
    generateNewAddressRequest,
    generateNewAddressError,
} from '../../shared/actions/tempAccount';
import { getFromKeychain, getSeed } from '../../shared/libs/cryptography';
import TransactionRow from '../components/transactionRow';
import DropdownHolder from '../components/dropdownHolder';

const width = Dimensions.get('window').width;
const height = global.height;
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
            this.props.setReceiveAddress(' ');
        }
    }

    onGeneratePress() {
        this.props.generateNewAddressRequest();
        const dropdown = DropdownHolder.getDropdown();
        const seedIndex = this.props.tempAccount.seedIndex;
        const seedName = this.props.account.seedNames[seedIndex];
        const accountInfo = this.props.account.accountInfo;
        const currentSeedAccountInfo = accountInfo[Object.keys(accountInfo)[seedIndex]];
        const addresses = currentSeedAccountInfo.addresses;
        getFromKeychain(this.props.tempAccount.password, value => {
            if (typeof value != 'undefined' && value != null) {
                const seed = getSeed(value, seedIndex);
                generate(seed, seedName, addresses);
            } else {
                error();
            }
        });

        const generate = (seed, seedName, addresses) => this.props.generateNewAddress(seed, seedName, addresses);
        const error = () => {
            this.props.generateNewAddressError();
            dropdown.alertWithType('error', 'Something went wrong', 'Please restart the app.');
        };
    }

    onAddressPress(address) {
        const dropdown = DropdownHolder.getDropdown();
        if (address !== ' ') {
            Clipboard.setString(address);
            dropdown.alertWithType('success', 'Address copied', 'Your address has been copied to the clipboard.');
        }
    }

    getOpacity() {
        const { tempAccount: { receiveAddress } } = this.props;
        if (receiveAddress == ' ') {
            return 0.1;
        } else {
            return 1;
        }
    }

    render() {
        const { tempAccount: { receiveAddress, isGeneratingReceiveAddress }, t } = this.props;

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={{ paddingBottom: height / 40, opacity: this.getOpacity() }}>
                    <View style={styles.qrContainer}>
                        <QRCode value={receiveAddress} size={width / 2.5} bgColor="#000" fgColor="#FFF" />
                    </View>
                </View>
                <View style={{ paddingBottom: height / 40, opacity: this.getOpacity() }}>
                    <TouchableOpacity onPress={() => this.onAddressPress(receiveAddress)}>
                        <View style={styles.receiveAddressContainer}>
                            <Text style={styles.receiveAddressText}>{receiveAddress}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                {receiveAddress === ' ' &&
                    !isGeneratingReceiveAddress && (
                        <TouchableOpacity
                            onPress={() => {
                                // Check if there's already a network call in progress.
                                if (!isGeneratingReceiveAddress) {
                                    this.onGeneratePress();
                                }
                            }}
                        >
                            <View style={styles.generateButton}>
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
        width: width / 2.14,
        height: width / 4.2,
        justifyContent: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 5,
    },
    receiveAddressText: {
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 31.8,
        color: 'white',
        backgroundColor: 'transparent',
        padding: width / 25,
        textAlign: 'center',
    },
    generateButton: {
        borderColor: 'rgba(255,255,255,0.6)',
        borderWidth: 1.5,
        borderRadius: 8,
        width: width / 2,
        height: height / 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#009f3f',
    },
    generateText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
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
    qrContainer: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: width / 30,
    },
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    generateNewAddress: (seed, seedName, addresses) => dispatch(generateNewAddress(seed, seedName, addresses)),
    setReceiveAddress: payload => dispatch(setReceiveAddress(payload)),
    generateNewAddressRequest: () => dispatch(generateNewAddressRequest()),
    generateNewAddressError: () => dispatch(generateNewAddressError()),
});

Receive.propTypes = {
    tempAccount: PropTypes.object.isRequired,
    generateNewAddress: PropTypes.func.isRequired,
    setReceiveAddress: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(Receive);
