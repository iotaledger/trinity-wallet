import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import OnboardingButtons from '../components/onboardingButtons.js';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';

import { width, height } from '../util/dimensions';

class TransferConfirmationModal extends Component {
    constructor(props) {
        super(props);
    }

    onSendPress() {
        this.props.hideModal(() => {
            this.timeout = setTimeout(() => {
                this.props.sendTransfer();
            }, 250);
            this.props.clearOnSend();
        });
    }

    render() {
        const { t, backgroundColor } = this.props;
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
        return (
            <View style={{ width: width / 1.15, alignItems: 'center', backgroundColor }}>
                <View style={styles.modalContent}>
                    <View style={styles.textContainer}>
                        <Text style={styles.text}>
                            <Text style={styles.regularText}>
                                {t('transferConfirmation:youAreAbout', { contents: transferContents })}
                            </Text>
                        </Text>
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
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
    },
    regularText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
    },
    middleText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
        paddingBottom: height / 80,
    },
    addressText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
        marginBottom: height / 30,
        marginTop: height / 70,
    },
    iotaText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
    },
});

export default translate(['transferConfirmation', 'global'])(TransferConfirmationModal);
