import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { round } from 'iota-wallet-shared-modules/libs/utils';
import { formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/iota/utils';
import StatefulDropdownAlert from '../containers/StatefulDropdownAlert';
import ModalButtons from '../containers/ModalButtons';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        width,
        height,
        justifyContent: 'center',
    },
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: height / 30,
        width: width / 1.15,
        paddingHorizontal: width / 20,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize2,
    },
    regularText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize2,
    },
    boldText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
    },
    addressText: {
        backgroundColor: 'transparent',
        fontFamily: 'Inconsolata-Bold',
        fontSize: GENERAL.fontSize4,
    },
    iotaText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
    },
});

class TransferConfirmationModal extends Component {
    static propTypes = {
        /** Closes acive modal */
        hideModal: PropTypes.func.isRequired,
        /** Make transaction */
        sendTransfer: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Receive address */
        address: PropTypes.string.isRequired,
        /** Content text color */
        textColor: PropTypes.object.isRequired,
        /** Content border color */
        borderColor: PropTypes.object.isRequired,
        /** Transaction value */
        value: PropTypes.number.isRequired,
        /** Set a flag for a transfer in progress */
        setSendingTransferFlag: PropTypes.func.isRequired,
        /** Tokens to Fiat converted text */
        conversionText: PropTypes.string.isRequired,
        /** Transaction value as a string */
        amount: PropTypes.string.isRequired,
        /** Theme setting */
        body: PropTypes.object.isRequired,
        /** Theme setting */
        bar: PropTypes.object.isRequired,
        /** Name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Determines if user has activated fingerprint auth */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** Activates fingerprint scanner */
        activateFingerprintScanner: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            sending: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('TransferConfirmationModal');
    }

    onSendPress() {
        const { hideModal, sendTransfer, setSendingTransferFlag, isFingerprintEnabled, value } = this.props;
        const { sending } = this.state;

        // Prevent multiple spends
        if (sending) {
            return;
        }

        this.setState({ sending: true });

        if (isFingerprintEnabled && value > 0) {
            this.props.activateFingerprintScanner();
        } else {
            hideModal();
            setSendingTransferFlag();
            sendTransfer();
        }
    }

    render() {
        const { t, body, bar, textColor, borderColor, value, conversionText, amount, selectedAccountName } = this.props;
        // TODO: fix this using trans component

        /*
        let transferContents = null;
        if (value === 0) {
            transferContents = <Text style={styles.iotaText}>{t('transferConfirmation:aMessage')}</Text>;
        } else {
            transferContents = (
                <Text style={styles.iotaText}>
                    {formatValue(value)} {formatUnit(value)}
                </Text>
            );
        }
        */

        // Hotfix

        let transferContents = null;
        /* eslint-disable eqeqeq */
        if (value === 0 || amount === '') {
            /* eslint-enable eqeqeq */
            // doesn't work with === for some reason
            transferContents = <Text style={styles.iotaText}>a message</Text>;
        } else {
            transferContents = (
                <Text style={styles.iotaText}>
                    {' '}
                    {round(formatValue(value), 3)} {formatUnit(value)} ({conversionText}){' '}
                </Text>
            );
        }
        return (
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, borderColor, { backgroundColor: body.bg }]}>
                    {(value !== 0 && (
                        <View style={styles.textContainer}>
                            <Text style={[styles.text, textColor, { paddingTop: height / 50 }]}>
                                <Text style={[styles.regularText, textColor]}>Sending {transferContents} from</Text>
                            </Text>
                            <Text style={[styles.boldText, textColor, { paddingTop: height / 25 }]}>
                                {selectedAccountName}
                            </Text>
                            <Text style={[styles.regularText, textColor, { paddingTop: height / 90 }]}>to</Text>
                            <Text style={[styles.addressText, textColor, { marginTop: height / 70 }]}>
                                {this.props.address.substring(0, 30)}
                            </Text>
                            <Text style={[styles.addressText, textColor]}>{this.props.address.substring(30, 60)}</Text>
                            <Text style={[styles.addressText, textColor, { marginBottom: height / 18 }]}>
                                {this.props.address.substring(60, 90)}
                            </Text>
                        </View>
                    )) || (
                        <View style={styles.textContainer}>
                            <Text style={[styles.text, textColor, { paddingTop: height / 50 }]}>
                                <Text style={[styles.regularText, textColor]}>
                                    You are about to send {transferContents}
                                </Text>
                            </Text>
                            <Text style={[styles.regularText, textColor, { paddingTop: height / 90 }]}>to</Text>
                            <Text style={[styles.addressText, textColor, { marginTop: height / 70 }]}>
                                {this.props.address.substring(0, 30)}
                            </Text>
                            <Text style={[styles.addressText, textColor]}>{this.props.address.substring(30, 60)}</Text>
                            <Text style={[styles.addressText, textColor, { marginBottom: height / 18 }]}>
                                {this.props.address.substring(60, 90)}
                            </Text>
                        </View>
                    )}
                    <ModalButtons
                        onLeftButtonPress={() => this.props.hideModal()}
                        onRightButtonPress={() => this.onSendPress()}
                        leftText={t('global:cancel')}
                        rightText={t('global:send')}
                        buttonWidth={{ width: width / 3.2 }}
                        containerWidth={{ width: width / 1.4 }}
                    />
                </View>
                <StatefulDropdownAlert backgroundColor={bar.bg} />
            </View>
        );
    }
}

export default translate(['transferConfirmation', 'global'])(TransferConfirmationModal);
