import trim from 'lodash/trim';
import React from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, Image, Keyboard } from 'react-native';
import Modal from 'react-native-modal';
import { MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'iota-wallet-shared-modules/libs/util';
import blackArrowRightImagePath from 'iota-wallet-shared-modules/images/arrow-right-black.png';
import whiteArrowRightImagePath from 'iota-wallet-shared-modules/images/arrow-right-white.png';
import { getChecksum } from 'iota-wallet-shared-modules/libs/iota/utils';
import CustomTextInput from '../components/customTextInput';
import QRScanner from '../components/qrScanner';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

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
    infoIcon: {
        width: width / 20,
        height: width / 20,
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
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    iconRight: {
        width: width / 28,
        height: width / 28,
    },
    titleTextRight: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
    checksum: {
        width: width / 8,
        height: height / 20,
        borderRadius: GENERAL.borderRadiusSmall,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checksumText: {
        fontSize: width / 29.6,
        fontFamily: 'Lato-Regular',
    },
});

class UseExistingSeed extends React.Component {
    static propTypes = {
        seedCount: PropTypes.number.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        ctaColor: PropTypes.string.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        arrowLeftImagePath: PropTypes.number.isRequired,
        secondaryCtaColor: PropTypes.string.isRequired,
        textColor: PropTypes.object.isRequired,
        ctaBorderColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        addAccount: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
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

    getChecksumValue() {
        const { seed } = this.state;
        let checksumValue = '...';

        if (seed.length !== 0 && !seed.match(VALID_SEED_REGEX)) {
            checksumValue = '!';
        } else if (seed.length !== 0 && seed.length < 81) {
            checksumValue = '< 81';
        } else if (seed.length === 81 && seed.match(VALID_SEED_REGEX)) {
            checksumValue = getChecksum(seed);
        }
        return checksumValue;
    }

    showModal = () => this.setState({ isModalVisible: true });

    hideModal = () => this.setState({ isModalVisible: false });

    renderModalContent = () => (
        <QRScanner
            ctaColor={this.props.ctaColor}
            backgroundColor={this.props.backgroundColor}
            onQRRead={(data) => this.onQRRead(data)}
            hideModal={() => this.hideModal()}
            secondaryCtaColor={this.props.secondaryCtaColor}
            ctaBorderColor={this.props.ctaBorderColor}
            secondaryBackgroundColor={this.props.secondaryBackgroundColor}
        />
    );

    render() {
        const { t, textColor, secondaryBackgroundColor, arrowLeftImagePath, negativeColor } = this.props;
        const { seed, accountName } = this.state;
        const isWhite = secondaryBackgroundColor === 'white';
        const arrowRightImagePath = isWhite ? whiteArrowRightImagePath : blackArrowRightImagePath;
        const checksumBackgroundColor = isWhite
            ? { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            : { backgroundColor: 'rgba(0, 0, 0, 0.05)' };

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
                            secondaryBackgroundColor={secondaryBackgroundColor}
                            negativeColor={negativeColor}
                            widget="qr"
                            onQRPress={() => this.onQRPress()}
                        />
                        <View style={{ flex: 0.6 }} />
                        <View style={[styles.checksum, checksumBackgroundColor]}>
                            <Text style={[styles.checksumText, textColor]}>{this.getChecksumValue()}</Text>
                        </View>
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
                            secondaryBackgroundColor={secondaryBackgroundColor}
                            negativeColor={negativeColor}
                            value={accountName}
                        />
                        <View style={{ flex: 1.2 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.backPress()}
                            style={{ flex: 1 }}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.iconLeft} />
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
                                <Image source={arrowRightImagePath} style={styles.iconRight} />
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

export default translate(['addAdditionalSeed', 'useExistingSeed', 'global'])(UseExistingSeed);
