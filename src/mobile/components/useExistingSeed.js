import trim from 'lodash/trim';
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, Image } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import QRScanner from '../components/qrScanner.js';
import { Keyboard } from 'react-native';
import { setSeed } from 'iota-wallet-shared-modules/actions/tempAccount';
import Modal from 'react-native-modal';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import cameraImagePath from 'iota-wallet-shared-modules/images/camera.png';
import arrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left.png';
import arrowRightImagePath from 'iota-wallet-shared-modules/images/arrow-right.png';
import { getChecksum } from 'iota-wallet-shared-modules/libs/iota';
import GENERAL from '../theme/general';

import { width, height } from '../util/dimensions';

class UseExistingSeed extends React.Component {
    static propTypes = {
        seedCount: PropTypes.number.isRequired,
        addAccount: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            seed: '',
            accountName: this.getDefaultAccountName(),
            isModalVisible: false,
        };
    }

    getDefaultAccountName() {
        if (this.props.seedCount === 0) {
            return 'MAIN ACCOUNT';
        } else if (this.props.seedCount === 1) {
            return 'SECOND ACCOUNT';
        } else if (this.props.seedCount === 2) {
            return 'THIRD ACCOUNT';
        } else if (this.props.seedCount === 3) {
            return 'FOURTH ACCOUNT';
        } else if (this.props.seedCount === 4) {
            return 'FIFTH ACCOUNT';
        } else if (this.props.seedCount === 5) {
            return 'SIXTH ACCOUNT';
        } else if (this.props.seedCount === 6) {
            return 'OTHER ACCOUNT';
        } else {
            return '';
        }
    }

    onQRPress() {
        this._showModal();
    }

    onQRRead(data) {
        this.setState({
            seed: data,
        });

        this._hideModal();
    }

    _showModal = () => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    _renderModalContent = () => (
        <QRScanner onQRRead={data => this.onQRRead(data)} hideModal={() => this._hideModal()} />
    );

    getChecksumValue() {
        const { seed } = this.state;
        let checksumValue = '...';

        if (seed.length !== 0 && seed.length < 81) {
            checksumValue = '< 81';
        } else if (seed.length === 81) {
            checksumValue = getChecksum(seed);
        }
        return checksumValue;
    }

    render() {
        const { seed, accountName } = this.state;

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={styles.seedContainer}>
                            <View style={{ flex: 0.5 }} />
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>Enter a seed and account name.</Text>
                            </View>
                            <View style={{ flex: 1 }} />
                            <View style={{ flexDirection: 'row', width: width / 1.4 }}>
                                <View style={styles.textFieldContainer}>
                                    <TextField
                                        style={styles.textField}
                                        labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                        labelFontSize={width / 31.8}
                                        fontSize={width / 20.7}
                                        labelPadding={3}
                                        baseColor="white"
                                        tintColor="#F7D002"
                                        enablesReturnKeyAutomatically={true}
                                        label="Seed"
                                        autoCorrect={false}
                                        value={seed}
                                        maxLength={MAX_SEED_LENGTH}
                                        onChangeText={seed => this.setState({ seed: seed.toUpperCase() })}
                                        onSubmitEditing={() => this.refs.accountName.focus()}
                                    />
                                </View>
                                <View style={styles.qrButtonContainer}>
                                    <TouchableOpacity onPress={() => this.onQRPress()}>
                                        <View style={styles.qrButton}>
                                            <Image source={cameraImagePath} style={styles.qrImage} />
                                            <Text style={styles.qrText}> QR </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flex: 1 }} />
                            <View style={styles.checksum}>
                                <Text style={styles.checksumText}>{this.getChecksumValue()}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1 }} />
                        <View style={styles.accountNameContainer}>
                            <TextField
                                ref="accountName"
                                style={styles.textField}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={width / 31.8}
                                fontSize={width / 20.7}
                                labelPadding={3}
                                baseColor="white"
                                tintColor="#F7D002"
                                enablesReturnKeyAutomatically={true}
                                label="Account name"
                                autoCapitalize="words"
                                autoCorrect={false}
                                value={accountName}
                                containerStyle={{ width: width / 1.4 }}
                                onChangeText={accountName => this.setState({ accountName })}
                            />
                        </View>
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={event => this.props.backPress()} style={{ flex: 1 }}>
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.iconLeft} />
                                <Text style={styles.titleTextLeft}>Back</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={event => this.props.addAccount(seed, trim(accountName))}
                            style={{ flex: 1 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={styles.titleTextRight}>Done</Text>
                                <Image source={arrowRightImagePath} style={styles.iconRight} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Modal
                        animationIn={'bounceInUp'}
                        animationOut={'bounceOut'}
                        animationInTiming={1000}
                        animationOutTiming={200}
                        backdropTransitionInTiming={500}
                        backdropTransitionOutTiming={200}
                        backdropColor={'#102832'}
                        backdropOpacity={1}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={this.state.isModalVisible}
                    >
                        {this._renderModalContent()}
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 1,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topContainer: {
        flex: 9,
        justifyContent: 'flex-start',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: height / 30,
    },
    subtitleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: height / 30,
    },
    title: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    infoIcon: {
        width: width / 20,
        height: width / 20,
    },
    qrImage: {
        height: width / 28,
        width: width / 28,
        marginRight: width / 100,
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 0.8,
        borderRadius: GENERAL.borderRadius,
        width: width / 6.5,
        height: height / 16,
    },
    qrText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    textFieldContainer: {
        flex: 1,
        paddingRight: width / 30,
        justifyContent: 'center',
    },
    textField: {
        color: 'white',
        fontFamily: 'Lato-Light',
    },
    qrButtonContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height / 90,
    },
    accountNameContainer: {
        flex: 4,
        alignItems: 'center',
    },
    seedContainer: {
        flex: 6.5,
        alignItems: 'center',
    },
    titleTextLeft: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    titleTextRight: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 25,
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
    iconLeft: {
        width: width / 22,
        height: width / 22,
        marginRight: width / 25,
    },
    iconRight: {
        width: width / 22,
        height: width / 22,
    },
    checksum: {
        width: width / 8,
        height: height / 20,
        borderRadius: GENERAL.borderRadiusSmall,
        borderColor: 'white',
        borderWidth: height / 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checksumText: {
        fontSize: width / 29.6,
        color: 'white',
        fontFamily: 'Lato-Regular',
    },
});

export default UseExistingSeed;
