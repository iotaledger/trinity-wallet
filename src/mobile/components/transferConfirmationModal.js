import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { formatValue, formatUnit, round } from 'iota-wallet-shared-modules/libs/util';
import OnboardingButtons from '../components/onboardingButtons';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: height / 30,
        width: width / 1.2,
        paddingHorizontal: width / 20,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 29.6,
    },
    regularText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 29.6,
    },
    boldText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 25.9,
    },
    middleText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
        paddingBottom: height / 80,
    },
    addressText: {
        backgroundColor: 'transparent',
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 21.8,
    },
    iotaText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 25.9,
    },
});

class TransferConfirmationModal extends Component {
    static propTypes = {
        hideModal: PropTypes.func.isRequired,
        sendTransfer: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        address: PropTypes.string.isRequired,
        body: PropTypes.object.isRequired,
        textColor: PropTypes.object.isRequired,
        borderColor: PropTypes.object.isRequired,
        value: PropTypes.number.isRequired,
        setSendingTransferFlag: PropTypes.func.isRequired,
        conversionText: PropTypes.string.isRequired,
        amount: PropTypes.string.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
    };

    constructor() {
        super();
        this.state = {
            sending: false,
        };
    }

    onSendPress() {
        const { hideModal, sendTransfer, setSendingTransferFlag } = this.props;
        const { sending } = this.state;

        // Prevent multiple spends
        if (sending) {
            return;
        }

        this.setState({ sending: true });

        // Prevent modal close lag
        hideModal(() => {
            setSendingTransferFlag();
            this.timeout = setTimeout(() => {
                sendTransfer();
            }, 300);
        });
    }

    render() {
        const { t, body, textColor, borderColor, value, conversionText, amount, selectedAccountName } = this.props;
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
            <View style={{ width: width / 1.2, alignItems: 'center', backgroundColor: body.bg }}>
                <View style={[styles.modalContent, borderColor]}>
                    {(value !== 0 && (
                        <View style={styles.textContainer}>
                            <Text style={[styles.text, textColor, { paddingTop: height / 50 }]}>
                                <Text style={[styles.regularText, textColor]}>
                                    You are about to send {transferContents} from
                                </Text>
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
                    <OnboardingButtons
                        onLeftButtonPress={() => this.props.hideModal()}
                        onRightButtonPress={() => this.onSendPress()}
                        leftText={t('global:cancel')}
                        rightText={t('global:send')}
                        buttonWidth={{ width: width / 3.2 }}
                        containerWidth={{ width: width / 1.4 }}
                    />
                </View>
            </View>
        );
    }
}

export default translate(['transferConfirmation', 'global'])(TransferConfirmationModal);
