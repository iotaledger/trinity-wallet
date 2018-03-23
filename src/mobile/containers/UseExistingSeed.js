import trim from 'lodash/trim';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Modal from 'react-native-modal';
import { MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'iota-wallet-shared-modules/libs/iota/utils';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import CustomTextInput from '../components/CustomTextInput';
import Checksum from '../components/Checksum';
import QRScanner from '../components/QrScanner';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';

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
        justifyContent: 'center',
        alignItems: 'center',
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
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    textFieldContainer: {
        flex: 1,
        paddingRight: width / 30,
        justifyContent: 'center',
    },
    textField: {
        fontFamily: 'Lato-Light',
    },
    accountNameContainer: {
        flex: 4,
        alignItems: 'center',
    },
    seedContainer: {
        flex: 6.5,
        alignItems: 'center',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

class UseExistingSeed extends Component {
    static propTypes = {
        seedCount: PropTypes.number.isRequired,
        theme: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
        addAccount: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        setSetting: PropTypes.func.isRequired,
        textColor: PropTypes.object.isRequired,
        input: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            seed: '',
            accountName: this.getDefaultAccountName(),
            isModalVisible: false,
        };
    }

    onQRPress() {
        this.showModal();
    }

    onQRRead(data) {
        const dataString = data.toString();
        if (dataString.length === 81 && dataString.match(VALID_SEED_REGEX)) {
            this.setState({
                seed: data,
            });
        } else {
            this.props.generateAlert(
                'error',
                'Incorrect seed format',
                'Valid seeds should be 81 characters and contain only A-Z or 9.',
            );
        }

        this.hideModal();
    }

    getDefaultAccountName() {
        const { t } = this.props;
        if (this.props.seedCount === 0) {
            return t('global:mainWallet');
        } else if (this.props.seedCount === 1) {
            return t('global:secondWallet');
        } else if (this.props.seedCount === 2) {
            return t('global:thirdWallet');
        } else if (this.props.seedCount === 3) {
            return t('global:fourthWallet');
        } else if (this.props.seedCount === 4) {
            return t('global:fifthWallet');
        } else if (this.props.seedCount === 5) {
            return t('global:sixthWallet');
        } else if (this.props.seedCount === 6) {
            return t('global:otherWallet');
        }
        return '';
    }

    showModal = () => this.setState({ isModalVisible: true });

    hideModal = () => this.setState({ isModalVisible: false });

    renderModalContent = () => {
        const { body, primary } = this.props;
        return (
            <QRScanner
                primary={primary}
                body={body}
                onQRRead={(data) => this.onQRRead(data)}
                hideModal={() => this.hideModal()}
            />
        );
    };

    render() {
        const { t, body, theme, textColor, input } = this.props;
        const { seed, accountName } = this.state;

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.8 }} />
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, textColor]}>{t('useExistingSeed:title')}</Text>
                        </View>
                        <View style={{ flex: 0.4 }} />
                        <CustomTextInput
                            label={t('global:seed')}
                            onChangeText={(value) => this.setState({ seed: value })}
                            containerStyle={{ width: width / 1.2 }}
                            autoCapitalize="characters"
                            maxLength={MAX_SEED_LENGTH}
                            value={seed}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="next"
                            onSubmitEditing={() => this.accountNameField.focus()}
                            theme={theme}
                            widget="qr"
                            onQRPress={() => this.onQRPress()}
                        />
                        <View style={{ flex: 0.6 }} />
                        <Checksum seed={seed} input={input} />
                        <View style={{ flex: 0.3 }} />
                        <CustomTextInput
                            onRef={(c) => {
                                this.accountNameField = c;
                            }}
                            label={t('addAdditionalSeed:accountName')}
                            onChangeText={(value) => this.setState({ accountName: value })}
                            containerStyle={{ width: width / 1.2 }}
                            autoCapitalize="words"
                            maxLength={MAX_SEED_LENGTH}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            theme={theme}
                            value={accountName}
                        />
                        <View style={{ flex: 1.2 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('addNewAccount')}
                            style={{ flex: 1 }}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={body.color} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.props.addAccount(seed, trim(accountName))}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                            style={{ flex: 1 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:doneLowercase')}</Text>
                                <Icon name="chevronRight" size={width / 28} color={body.color} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Modal
                        animationIn="bounceInUp"
                        animationOut="bounceOut"
                        animationInTiming={1000}
                        animationOutTiming={200}
                        backdropTransitionInTiming={500}
                        backdropTransitionOutTiming={200}
                        backdropColor="#102832"
                        backdropOpacity={1}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={this.state.isModalVisible}
                        onBackButtonPress={() => this.setState({ isModalVisible: false })}
                        useNativeDriver
                        hideModalContentWhileAnimating
                    >
                        {this.renderModalContent()}
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    seedCount: state.account.seedCount,
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
};

export default translate(['addAdditionalSeed', 'useExistingSeed', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(UseExistingSeed),
);
