import React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    ScrollView,
    ImageBackground,
    StatusBar,
    KeyboardAvoidingView,
} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import DropdownAlert from 'react-native-dropdownalert';
import QRScanner from '../components/qrScanner.js';
import { Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { setSeed } from 'iota-wallet-shared-modules/actions/tempAccount';
import Modal from 'react-native-modal';
import OnboardingButtons from '../components/onboardingButtons.js';
import { getFullAccountInfo, setFirstUse, increaseSeedCount, addAccountName } from '../../shared/actions/account';
import { generateAlert } from '../../shared/actions/alerts';
import { clearTempData } from '../../shared/actions/tempAccount';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';

import DropdownHolder from '../components/dropdownHolder';

import { width, height } from '../util/dimensions';
import { isAndroid } from '../util/device';
const StatusBarDefaultBarStyle = 'light-content';

class UseExistingSeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            seed: '',
            accountName: this.getDefaultAccountName(),
            isModalVisible: false,
        };
    }

    getDefaultAccountName() {
        const { t } = this.props;

        if (this.props.seedCount == 0) {
            return 'MAIN ACCOUNT';
        } else if (this.props.seedCount == 1) {
            return 'SECOND ACCOUNT';
        } else if (this.props.seedCount == 2) {
            return 'THIRD ACCOUNT';
        } else if (this.props.seedCount == 3) {
            return 'FOURTH ACCOUNT';
        } else if (this.props.seedCount == 4) {
            return 'FIFTH ACCOUNT';
        } else if (this.props.seedCount == 5) {
            return 'SIXTH ACCOUNT';
        } else if (this.props.seedCount == 6) {
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

    render() {
        const { seed, accountName } = this.state;
        const { t } = this.props;

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={styles.seedContainer}>
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>Please enter your seed.</Text>
                            </View>
                            <View style={{ flexDirection: 'row' }}>
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
                                            <Image
                                                source={require('iota-wallet-shared-modules/images/camera.png')}
                                                style={styles.qrImage}
                                            />
                                            <Text style={styles.qrText}> QR </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={{ flex: 1 }} />
                        <View style={styles.accountNameContainer}>
                            <View style={styles.subtitleContainer}>
                                <Text style={styles.title}>Enter an account name.</Text>
                            </View>
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
                                autoCapitalize="characters"
                                autoCorrect={false}
                                value={accountName}
                                containerStyle={{ width: width / 1.36 }}
                                autoCapitalize={'characters'}
                                onChangeText={accountName => this.setState({ accountName })}
                            />
                        </View>
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={event => this.props.backPress()} style={{ flex: 1 }}>
                            <View style={styles.itemLeft}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/arrow-left.png')}
                                    style={styles.iconLeft}
                                />
                                <Text style={styles.titleTextLeft}>Back</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={event => this.props.addAccount(seed, accountName)}
                            style={{ flex: 1 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={styles.titleTextRight}>Done</Text>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/arrow-right.png')}
                                    style={styles.iconRight}
                                />
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
        paddingTop: height / 25,
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
        borderRadius: 8,
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
    },
    seedContainer: {
        flex: 4,
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
});

export default UseExistingSeed;
