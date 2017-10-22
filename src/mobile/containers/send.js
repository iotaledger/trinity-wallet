import isUndefined from 'lodash/isUndefined';
import size from 'lodash/size';
import React, { Component } from 'react';
import { iota } from '../../shared/libs/iota';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    LayoutAnimation,
    ListView,
    ScrollView,
    Dimensions,
    StatusBar,
} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { connect } from 'react-redux';
import { round } from '../../shared/libs/util';
import { getFromKeychain } from '../../shared/libs/cryptography';
import { sendTransaction } from '../../shared/actions/iotaActions';
import DropdownAlert from 'react-native-dropdownalert';
import Modal from 'react-native-modal';

const StatusBarDefaultBarStyle = 'light-content';
const { height, width } = Dimensions.get('window');

class Send extends Component {
    constructor() {
        super();
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

        this.state = {
            denomination: 'Mi',
            amount: '',
            address: '',
            message: '',
            dataSource: ds.cloneWithRows([]),
        };
    }

    onDenominationPress() {
        switch (this.state.denomination) {
            case 'Mi':
                this.setState({ denomination: 'Gi' });
                break;
            case 'Gi':
                this.setState({ denomination: 'Ti' });
                break;
            case 'Ti':
                this.setState({ denomination: 'i' });
                break;
            case 'i':
                this.setState({ denomination: 'Ki' });
                break;
            case 'Ki':
                this.setState({ denomination: 'Mi' });
                break;
        }
    }

    onQRPress() {
        this._showModal();
    }

    onMaxPress() {
        this.setState({
            amount: (this.props.iota.balance / 1000000).toString(),
            denomination: 'Mi',
        });
    }

    hasInvalidCharacters(value) {
        // Currently just checks for white spaces
        const testAgainst = /\s/;
        return testAgainst.test(value);
    }

    isValidAddress(address) {
        return size(address) === 90 && iota.utils.isValidChecksum(address) && !this.hasInvalidCharacters(address);
    }

    renderInvalidAddressErrors(address) {
        const props = ['error', 'Invalid Address'];

        if (size(address) !== 90) {
            return this.dropdown.alertWithType(
                ...props,
                'Address should be 81 characters long and should have a checksum.',
            );
        } else if (this.hasInvalidCharacters(address)) {
            return this.dropdown.alertWithType(...props, 'Address contains invalid characters.');
        }

        return this.dropdown.alertWithType(...props, 'Address contains invalid checksum');
    }

    sendTransaction() {
        const address = this.state.address;
        const value = parseInt(this.state.amount);
        const message = this.state.message;

        const isValid = this.isValidAddress(address);

        if (isValid) {
            getFromKeychain(this.props.iota.password, seed => {
                if (!isUndefined(seed)) {
                    sendTx(seed);
                    if (!sendTransaction(seed, address, value, message)) {
                        this.dropdown.alertWithType(
                            'error',
                            'Key reuse',
                            `The address you are trying to send to has already been used. Please try another address.`,
                        );
                    }
                } else {
                    console.log('error');
                }
            });
        } else {
            this.renderInvalidAddressErrors(address);
        }

        function sendTx(seed) {
            sendTransaction(seed, address, value, message);
        }
    }

    getUnitMultiplier() {
        let multiplier = 1;
        switch (this.state.denomination) {
            case 'i':
                break;
            case 'Ki':
                multiplier = 1000;
                break;
            case 'Mi':
                multiplier = 1000000;
                break;
            case 'Gi':
                multiplier = 1000000000;
                break;
            case 'Ti':
                multiplier = 1000000000000;
                break;
        }
        return multiplier;
    }

    _showModal = () => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    _renderModalContent = () => (
        <TouchableOpacity
            onPress={() => this._hideModal()}
            style={{ width: width / 1.1, height: height / 1.1, backgroundColor: 'white' }}
        >
            <View style={{ flex: 1, justifyContent: 'center' }} />
        </TouchableOpacity>
    );

    render() {
        let { amount, address, message } = this.state;
        return (
            <ScrollView scrollEnabled={false} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.textFieldContainer}>
                            <TextField
                                keyboardType={'numeric'}
                                style={styles.textField}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={height / 55}
                                fontSize={height / 40}
                                height={height / 24}
                                labelPadding={2}
                                baseColor="white"
                                tintColor="#F7D002"
                                enablesReturnKeyAutomatically={true}
                                label="Recipient address"
                                autoCorrect={false}
                                value={address}
                                onChangeText={address => this.setState({ address })}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => this.onQRPress()}>
                                <View style={styles.button}>
                                    <Image
                                        source={require('../../shared/images/camera.png')}
                                        style={styles.buttonImage}
                                    />
                                    <Text style={styles.qrText}> QR </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.textFieldContainer}>
                            <TextField
                                keyboardType={'numeric'}
                                style={styles.textField}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={height / 55}
                                fontSize={height / 40}
                                height={height / 24}
                                labelPadding={2}
                                baseColor="white"
                                enablesReturnKeyAutomatically={true}
                                label="Amount"
                                tintColor="#F7D002"
                                autoCorrect={false}
                                value={amount}
                                onChangeText={amount => this.setState({ amount })}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={ebent => this.onDenominationPress()}>
                                <View style={styles.button}>
                                    <Image
                                        source={require('../../shared/images/iota.png')}
                                        style={styles.buttonImage}
                                    />
                                    <Text style={styles.buttonText}> {this.state.denomination} </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.conversionText}>
                        {' '}
                        = ${' '}
                        {round(
                            parseInt(this.state.amount == '' ? 0 : this.state.amount) *
                                this.props.marketData.usdPrice /
                                1000000 *
                                this.getUnitMultiplier(),
                            2,
                        ).toFixed(2)}{' '}
                    </Text>
                    <View style={styles.maxButtonContainer}>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={event => this.onMaxPress()}>
                                <View style={styles.maxButton}>
                                    <Image source={require('../../shared/images/max.png')} style={styles.maxImage} />
                                    <Text style={styles.maxButtonText}> MAX </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TextField
                        style={styles.textField}
                        labelTextStyle={{ fontFamily: 'Lato-Light' }}
                        labelFontSize={height / 55}
                        fontSize={height / 40}
                        height={height / 24}
                        labelPadding={2}
                        baseColor="white"
                        enablesReturnKeyAutomatically={true}
                        label="Message"
                        tintColor="#F7D002"
                        autoCorrect={false}
                        value={message}
                        onChangeText={message => this.setState({ message })}
                    />
                    <View style={styles.sendIOTAButtonContainer}>
                        <TouchableOpacity onPress={event => this.sendTransaction()}>
                            <View style={styles.sendIOTAButton}>
                                <Image
                                    style={styles.sendIOTAImage}
                                    source={require('../../shared/images/sendIota.png')}
                                />
                                <Text style={styles.sendIOTAText}>SEND IOTA</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
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
                <Modal
                    animationIn={'bounceInUp'}
                    animationOut={'bounceOut'}
                    animationInTiming={1000}
                    animationOutTiming={200}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={200}
                    backdropColor={'#132d38'}
                    backdropOpacity={0.6}
                    style={{ alignItems: 'center' }}
                    isVisible={this.state.isModalVisible}
                >
                    {this._renderModalContent()}
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: height / 10,
    },
    topContainer: {
        paddingHorizontal: width / 10,
        zIndex: 1,
        flex: 1,
    },
    textFieldContainer: {
        flex: 1,
        paddingRight: width / 20,
    },
    textField: {
        color: 'white',
        fontFamily: 'Lato-Light',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 0.8,
        borderRadius: 8,
        width: width / 7,
        height: height / 20,
    },
    qrText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 39.8,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    buttonText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 36.8,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    buttonImage: {
        position: 'absolute',
        height: width / 28,
        width: width / 28,
        left: width / 40,
    },
    qrImage: {
        height: width / 28,
        width: width / 28,
        marginRight: width / 100,
    },
    buttonContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height / 90,
    },
    sendIOTAButton: {
        flexDirection: 'row',
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: 8,
        width: width / 3,
        height: height / 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#009f3f',
    },
    sendIOTAText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 40.5,
        backgroundColor: 'transparent',
        paddingLeft: 10,
    },
    sendIOTAImage: {
        height: width / 35,
        width: width / 35,
    },
    sendIOTAButtonContainer: {
        alignItems: 'center',
        paddingTop: height / 20,
    },
    separator: {
        flex: 1,
        height: 15,
    },
    conversionText: {
        fontFamily: 'Lato-Light',
        color: 'white',
        opacity: 1,
        backgroundColor: 'transparent',
        position: 'absolute',
        right: width / 3.5,
        top: height / 6.2,
    },
    maxButtonContainer: {
        alignItems: 'flex-start',
        marginTop: height / 150,
    },
    maxButtonText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 45.8,
        backgroundColor: 'transparent',
    },
    maxButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 0.8,
        borderRadius: 8,
        width: width / 7.7,
        height: height / 22,
    },
    maxImage: {
        height: width / 50,
        width: width / 34,
        marginRight: 2,
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
});

const mapDispatchToProps = dispatch => ({
    sendTransaction: (seed, address, value, message) => {
        dispatch(sendTransaction(seed, address, value, message));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Send);
