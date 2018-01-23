import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
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
        width: width / 1.15,
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
    };

    onSendPress() {
        this.props.hideModal(() => {
            this.timeout = setTimeout(() => {
                this.props.sendTransfer();
            }, 250);
        });
    }

    render() {
        const { t, backgroundColor, textColor, borderColor } = this.props;
        // TODO: fix this using trans component

        /*
        let transferContents = null;
        let amount = this.props.amount;
        let denomination = this.props.denomination;
        if (amount == 0) {
            //For some reason === does not work
            transferContents = (
                <Trans i18nKey="sendMessage">
                    <Text style={styles.regularText}>
                        You are about to send <Text style={styles.iotaText}>a message</Text> to the address
                    </Text>
                </Trans>
            );
        } else {
            transferContents = (
                <Trans i18nKey="sendValue">
                    <Text style={styles.regularText}>
                        You are about to send{' '}
                        <Text style={styles.iotaText}>
                            {{ amount }} {{ denomination }}
                        </Text>{' '}
                        to the address
                    </Text>
                </Trans>
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
            <View style={{ width: width / 1.15, alignItems: 'center', backgroundColor }}>
                <View style={[styles.modalContent, borderColor]}>
                    <View style={styles.textContainer}>
                        <Text style={styles.text}>{transferContents}</Text>
                        <Text numberOfLines={3} style={styles.addressText}>
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
