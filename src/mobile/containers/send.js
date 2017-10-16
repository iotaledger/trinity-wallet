import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableWithoutFeedback,
    TouchableOpacity,
    LayoutAnimation,
    ListView,
    ScrollView,
    Dimensions,
} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { connect } from 'react-redux';
import Triangle from 'react-native-triangle';
import TransactionRow from '../components/transactionRow.js';
import { round } from '../../shared/libs/util';
import { getFromKeychain } from '../../shared/libs/cryptography';
import { sendTransaction } from '../../shared/actions/iotaActions';

const { height, width } = Dimensions.get('window');
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

class Send extends React.Component {
    constructor(props) {
        super(props);
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

    onQRPress() {}

    onMaxPress() {
        this.setState({
            amount: (this.props.iota.balance / 1000000).toString(),
            denomination: 'Mi',
        });
    }

    sendTransaction() {
        var address = this.state.address;
        var value = parseInt(this.state.amount);
        var message = this.state.message;

        getFromKeychain(this.props.iota.password, seed => {
            if (typeof seed !== 'undefined') {
                sendTx(seed);
            } else {
                console.log('error');
            }
        });

        function sendTx(seed) {
            sendTransaction(seed, address, value, message);
        }
    }

    getUnitMultiplier() {
        var multiplier = 1;
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

    render() {
        let { amount, address, message } = this.state;
        return (
            <ScrollView scrollEnabled={false} style={styles.container}>
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
                            <TouchableOpacity onPress={this.onQRPress()}>
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
                {/* }<ListView
                style={{position: 'absolute', top: 250, left: 0, right: 0, bottom: 0}}
                dataSource={this.state.dataSource}
                renderRow={(data) => <TransactionRow rowData={data}/>}
                renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
              /> */}
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
        paddingTop: height / 150,
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
