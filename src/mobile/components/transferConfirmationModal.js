import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
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
        width: width / 1.05,
        paddingHorizontal: width / 20,
    },
    textContainer: {
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
    },
    regularText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
    },
    middleText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
        paddingBottom: height / 80,
    },
    addressText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        marginBottom: height / 30,
        marginTop: height / 70,
    },
    iotaText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
    },
});

class TransferConfirmationModal extends Component {
    static propTypes = {
        hideModal: PropTypes.func.isRequired,
        sendTransfer: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        address: PropTypes.string.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        textColor: PropTypes.object.isRequired,
        borderColor: PropTypes.object.isRequired,
        amount: PropTypes.string.isRequired,
        denomination: PropTypes.string.isRequired,
        setSendingTransferFlag: PropTypes.func.isRequired,
    };

    onSendPress() {
        const { hideModal, setSendingTransferFlag, sendTransfer } = this.props;
        hideModal(() => {
            setSendingTransferFlag();
            this.timeout = setTimeout(() => {
                sendTransfer();
            }, 300);
        });
    }

    render() {
        const { t, backgroundColor, textColor, borderColor } = this.props;
        // TODO: fix this using trans component

        /*
        let transferContents = null;
        if (this.props.amount === 0) {
            transferContents = <Text style={styles.iotaText}>{t('transferConfirmation:aMessage')}</Text>;
        } else {
            transferContents = (
                <Text style={styles.iotaText}>
                    {' '}
                    {this.props.amount} {this.props.denomination}{' '}
                </Text>
            );
        }
        */

        // Hotfix

        let transferContents = null;
        /* eslint-disable eqeqeq */
        if (this.props.amount == 0) {
            /* eslint-enable eqeqeq */
            // doesn't work with === for some reason
            transferContents = <Text style={styles.iotaText}>a message</Text>;
        } else {
            transferContents = (
                <Text style={styles.iotaText}>
                    {' '}
                    {this.props.amount} {this.props.denomination}{' '}
                </Text>
            );
        }
        return (
            <View style={{ width: width / 1.05, alignItems: 'center', backgroundColor }}>
                <View style={[styles.modalContent, borderColor]}>
                    <View style={styles.textContainer}>
                        <Text style={[styles.text, textColor]}>
                            <Text style={[styles.regularText, textColor]}>
                                You are about to send {transferContents} to the address
                            </Text>
                        </Text>
                        <Text numberOfLines={3} style={[styles.addressText, textColor]}>
                            {this.props.address}
                        </Text>
                    </View>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.props.hideModal()}
                        onRightButtonPress={() => this.onSendPress()}
                        leftText={t('global:cancel')}
                        rightText={t('global:send')}
                    />
                </View>
            </View>
        );
    }
}

export default translate(['transferConfirmation', 'global'])(TransferConfirmationModal);
