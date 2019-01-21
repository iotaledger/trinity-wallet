import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import arrowAnimation from 'shared-modules/animations/arrow-transfer.json';
import { round } from 'shared-modules/libs/utils';
import { formatValue, formatUnit } from 'shared-modules/libs/iota/utils';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import ModalView from './ModalView';
import TextWithLetterSpacing from './TextWithLetterSpacing';

const styles = StyleSheet.create({
    titleText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
    },
    addressText: {
        fontFamily: 'SourceCodePro-Medium',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        lineHeight: width / 17,
        justifyContent: 'center',
    },
    valueTextLarge: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize7,
    },
    messageText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
    },
    valueTextSmall: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
    },
    itemContainer: {
        borderRadius: Styling.borderRadiusExtraLarge,
        width: Styling.contentWidth,
        alignItems: 'center',
        paddingVertical: height / 25,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

class TransferConfirmationModal extends Component {
    static propTypes = {
        /** Closes acive modal */
        hideModal: PropTypes.func.isRequired,
        /** Make transaction */
        sendTransfer: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Receive address */
        address: PropTypes.string.isRequired,
        /** Transaction value */
        value: PropTypes.number.isRequired,
        /** Set a flag for a transfer in progress */
        setSendingTransferFlag: PropTypes.func.isRequired,
        /** Tokens to Fiat converted text */
        conversionText: PropTypes.string.isRequired,
        /** Transaction value as a string */
        amount: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** @ignore */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** Activates fingerprint scanner */
        activateFingerprintScanner: PropTypes.func.isRequired,
        /** Cancels send and closes modal */
        onBackButtonPress: PropTypes.func.isRequired,
        /** Transaction message */
        message: PropTypes.string,
    };

    static defaultProps = {
        message: '',
    };

    constructor() {
        super();
        this.state = {
            sending: false,
            scrollable: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('TransferConfirmationModal');
        this.animation.play();
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

    setScrollable(y) {
        if (y >= height / 5.8) {
            return this.setState({ scrollable: true });
        }
        this.setState({ scrollable: false });
    }

    render() {
        const {
            t,
            theme: { body, dark, primary },
            value,
            conversionText,
            amount,
            selectedAccountName,
            message,
        } = this.props;
        const isMessage = value === 0 || amount === '';
        return (
            <ModalView
                dualButtons
                displayTopBar
                onLeftButtonPress={() => this.props.onBackButtonPress()}
                onRightButtonPress={() => this.onSendPress()}
                leftButtonText={t('global:cancel')}
                rightButtonText={t('global:confirm')}
            >
                <View style={[styles.itemContainer, { backgroundColor: dark.color }]}>
                    <Text style={[styles.titleText, { color: primary.color }]}>
                        {isMessage
                            ? message.length > 0
                                ? t('sendingAMessage').toUpperCase()
                                : t('sendingAnEmptyMessage').toUpperCase()
                            : t('fromAccount', { selectedAccountName }).toUpperCase()}
                    </Text>
                    {isMessage &&
                        message.length > 0 && (
                            <ScrollView
                                scrollEnabled={this.state.scrollable}
                                showsVerticalScrollIndicator={this.state.scrollable}
                                style={{
                                    maxHeight: height / 5.8,
                                }}
                                onContentSizeChange={(x, y) => this.setScrollable(y)}
                            >
                                <View
                                    style={{
                                        paddingTop: height / 40,
                                        alignItems: 'center',
                                        paddingHorizontal: width / 20,
                                    }}
                                >
                                    <Text style={[styles.messageText, { color: body.color }]}>{message}</Text>
                                </View>
                            </ScrollView>
                        )}
                    {!isMessage && (
                        <View style={{ paddingTop: height / 80, alignItems: 'center' }}>
                            <View style={styles.valueContainer}>
                                <TextWithLetterSpacing
                                    spacing={width / 100}
                                    textStyle={[styles.valueTextLarge, { color: body.color }]}
                                >
                                    {round(formatValue(value), 3)}
                                </TextWithLetterSpacing>
                                <Text
                                    style={[
                                        styles.valueTextSmall,
                                        { color: body.color, marginTop: height / 36, paddingLeft: width / 40 },
                                    ]}
                                >
                                    {formatUnit(value)}
                                </Text>
                            </View>
                            <Text style={[styles.valueTextSmall, { color: body.color, marginTop: height / 200 }]}>
                                {conversionText}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={{ paddingVertical: height / 40 }}>
                    <LottieView
                        source={arrowAnimation}
                        style={{ width: width / 17, height: height / 18 }}
                        loop
                        autoPlay
                        ref={(animation) => {
                            this.animation = animation;
                        }}
                    />
                </View>
                <View style={[styles.itemContainer, { backgroundColor: dark.color }]}>
                    <Text style={[styles.titleText, { color: primary.color }]}>{t('toAddress').toUpperCase()}</Text>
                    <Text style={[styles.addressText, { color: body.color }, { marginTop: height / 40 }]}>
                        {this.props.address.substring(0, 30)}
                    </Text>
                    <Text style={[styles.addressText, { color: body.color }]}>
                        {this.props.address.substring(30, 60)}
                    </Text>
                    <Text style={[styles.addressText, { color: body.color }]}>
                        {this.props.address.substring(60, 90)}
                    </Text>
                </View>
            </ModalView>
        );
    }
}

export default withNamespaces(['transferConfirmation', 'global'])(TransferConfirmationModal);
