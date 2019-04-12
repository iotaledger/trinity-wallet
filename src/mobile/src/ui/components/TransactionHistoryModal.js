import assign from 'lodash/assign';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Clipboard, TouchableOpacity, View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { formatModalTime, convertUnixTimeToJSDate } from 'shared-modules/libs/date';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { locale, timezone } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import ModalView from './ModalView';
import DualFooterButtons from './DualFooterButtons';
import SingleFooterButton from './SingleFooterButton';

const contentWidth = width - width / 10;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width,
        justifyContent: 'flex-end',
        height,
        flex: 1,
    },
    modalContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        width,
        height: height - Styling.topBarHeight,
    },
    historyContent: {
        width: contentWidth,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize6,
    },
    unitText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        marginTop: height / 100,
    },
    confirmationWrapper: {
        alignItems: 'center',
        marginBottom: height / 40,
        width: contentWidth,
    },
    bundleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bundleInnerWrapper: {
        flex: 7,
    },
    bundleHash: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceCodePro-Medium',
        fontSize: Styling.fontSize2,
        marginTop: 2,
        width: width / 1.4,
    },
    bundleSeparator: {
        flex: 1,
    },
    confirmation: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize2,
        paddingRight: width / 25,
    },
    timestamp: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        paddingTop: height / 50,
    },
    heading: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        paddingTop: height / 50,
        paddingBottom: height / 300,
    },
    text: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceCodePro-Medium',
        fontSize: Styling.fontSize1,
    },
    messageText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceCodePro-Medium',
        fontSize: Styling.fontSize1,
    },
    addressRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
    },
    addressRowTopWrapper: {
        flex: 4.7,
    },
    addressRowBottomWrapper: {
        flex: 1.3,
    },
    addressRowText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceCodePro-Medium',
        fontSize: Styling.fontSize1,
        textAlign: 'left',
        width: width / 1.4,
        height: height / 20,
    },
    addressRowValue: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize1,
        textAlign: 'right',
    },
});

export default class TransactionHistoryModal extends PureComponent {
    static propTypes = {
        /** Container element press event callback function */
        hideModal: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Promotes bundle
         * @param {string} bundle - bundle hash
         */
        promote: PropTypes.func.isRequired,
        /** Bundle outputs */
        outputs: PropTypes.array.isRequired,
        /** Determines whether transaction is sent or received */
        incoming: PropTypes.bool.isRequired,
        /** Transaction boolean confirmation state */
        persistence: PropTypes.bool.isRequired,
        /** Currently selected mode */
        mode: PropTypes.oneOf(['Advanced', 'Standard']).isRequired,
        /** Transaction value */
        value: PropTypes.number.isRequired,
        /** Transaction value without rounding */
        fullValue: PropTypes.number.isRequired,
        /** Transaction unit */
        unit: PropTypes.string.isRequired,
        /** Transaction time */
        time: PropTypes.number.isRequired,
        /** Transaction message */
        message: PropTypes.string,
        /** Transaction bundle hash */
        bundle: PropTypes.string.isRequired,
        /** Determines whether the modal buttons should disable onPress event */
        disableWhen: PropTypes.bool.isRequired,
        /** Transaction addresses */
        relevantAddresses: PropTypes.arrayOf(
            PropTypes.shape({
                address: PropTypes.string.isRequired,
                value: PropTypes.number.isRequired,
                unit: PropTypes.string.isRequired,
            }),
        ).isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** Content styles */
        style: PropTypes.shape({
            titleColor: PropTypes.string.isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            backgroundColor: PropTypes.string.isRequired,
        }).isRequired,
        /** Determines whether the current bundle is being promoted */
        bundleIsBeingPromoted: PropTypes.bool.isRequired,
        /* eslint-disable react/no-unused-prop-types */
        /** Checks if it's a failed transaction */
        isFailedTransaction: PropTypes.bool.isRequired,
        /** @ignore */
        retryFailedTransaction: PropTypes.func.isRequired,
        /** @ignore */
        isRetryingFailedTransaction: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        message: 'Empty',
    };

    constructor(props) {
        super(props);
        this.state = {
            addressesScrollable: false,
            messagesScrollable: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('HistoryModalContent');
    }

    setAddressesScrollable(y) {
        if (y >= height / 5.3) {
            return this.setState({ addressesScrollable: true });
        }
        this.setState({ addressesScrollable: false });
    }

    setMessagesScrollable(y) {
        if (y >= height / 7.2) {
            return this.setState({ messagesScrollable: true });
        }
        this.setState({ messagesScrollable: false });
    }

    copy(item, type) {
        const { t } = this.props;

        const types = {
            bundle: [t('bundleHashCopied'), t('bundleHashCopiedExplanation')],
            address: [t('addressCopied'), t('addressCopiedExplanation')],
            message: [t('messageCopied'), t('messageCopiedExplanation')],
        };

        Clipboard.setString(item);

        if (types[type]) {
            this.props.generateAlert('success', ...types[type]);
        }
    }

    computeStatusText(outputs, persistence, incoming) {
        const { t } = this.props;
        const receiveStatus = persistence ? t('global:youReceived') : t('global:receiving');
        const sendStatus = persistence ? t('global:youSent') : t('global:sending');
        return incoming ? receiveStatus : sendStatus;
    }

    renderAddressRow(address) {
        const { style } = this.props;

        return (
            <View style={styles.addressRowContainer}>
                <TouchableOpacity
                    onPress={() => this.copy(address.address, 'address')}
                    style={styles.addressRowTopWrapper}
                >
                    <Text
                        numberOfLines={2}
                        ellipsizeMode="middle"
                        style={[styles.addressRowText, style.defaultTextColor]}
                    >
                        {address.address}
                    </Text>
                </TouchableOpacity>
                <View style={styles.addressRowBottomWrapper}>
                    <Text style={[styles.addressRowValue, style.defaultTextColor]} numberOfLines={1}>
                        {address.value} {address.unit}
                    </Text>
                </View>
            </View>
        );
    }

    renderAddresses() {
        const { relevantAddresses } = this.props;
        return (
            <FlatList
                data={relevantAddresses}
                keyExtractor={(item, index) => index}
                renderItem={({ item }) => this.renderAddressRow(item)}
                ItemSeparatorComponent={() => <View style={{ height: height / 300 }} />}
                scrollEnabled={false}
            />
        );
    }

    renderButton(buttonProps) {
        const { disableWhen, t, hideModal, bundleIsBeingPromoted, isRetryingFailedTransaction } = this.props;
        const opacity = { opacity: disableWhen ? 0.6 : 1 };
        const defaultProps = {
            onLeftButtonPress: () => {
                hideModal();
            },
            rightButtonStyle: { children: opacity },
            leftButtonText: t('global:close'),
            rightButtonText: t('global:retry'),
            isRightButtonLoading: bundleIsBeingPromoted || isRetryingFailedTransaction,
        };
        const props = assign({}, defaultProps, buttonProps);
        return <DualFooterButtons {...props} />;
    }

    render() {
        const {
            hideModal,
            fullValue,
            unit,
            outputs,
            incoming,
            persistence,
            time,
            bundle,
            message,
            t,
            style,
            mode,
            disableWhen,
            retryFailedTransaction,
            promote,
            isFailedTransaction,
            bundleIsBeingPromoted,
        } = this.props;
        const { addressesScrollable, messagesScrollable } = this.state;

        return (
            <ModalView
                modalButtons={
                    (!persistence &&
                        !isFailedTransaction &&
                        this.renderButton({
                            onRightButtonPress: () => {
                                if (!disableWhen) {
                                    return promote(bundle);
                                }
                                if (!bundleIsBeingPromoted) {
                                    this.props.generateAlert(
                                        'error',
                                        t('history:promotingAnotherBundle'),
                                        t('history:pleaseWait'),
                                    );
                                }
                            },
                        })) ||
                    (isFailedTransaction &&
                        this.renderButton({
                            onRightButtonPress: () => {
                                if (!disableWhen) {
                                    return retryFailedTransaction(bundle);
                                }
                                this.props.generateAlert(
                                    'error',
                                    t('history:promotingAnotherBundle'),
                                    t('history:pleaseWait'),
                                );
                            },
                        })) || <SingleFooterButton onButtonPress={hideModal} buttonText={t('done')} />
                }
                displayTopBar
            >
                <View style={{ flex: 1 }} />
                <View style={styles.historyContent}>
                    <View style={styles.confirmationWrapper}>
                        <View style={styles.statusContainer}>
                            <Text style={[styles.statusText, { color: style.titleColor }]}>
                                {this.computeStatusText(outputs, persistence, incoming)}
                            </Text>
                            <Text style={[styles.statusText, { color: style.titleColor }]}>
                                {' ' + fullValue + ' '}
                            </Text>
                            <Text style={[styles.unitText, { color: style.titleColor }]}>{unit}</Text>
                        </View>
                        <Text style={[styles.timestamp, style.defaultTextColor]}>
                            {formatModalTime(locale, timezone, convertUnixTimeToJSDate(time))}
                        </Text>
                    </View>
                    <Text style={[styles.heading, style.defaultTextColor]}>{t('bundleHash')}:</Text>
                    <View style={styles.bundleWrapper}>
                        <TouchableOpacity onPress={() => this.copy(bundle, 'bundle')} style={styles.bundleInnerWrapper}>
                            <Text
                                style={[styles.bundleHash, style.defaultTextColor]}
                                numberOfLines={2}
                                ellipsizeMode="middle"
                            >
                                {bundle}
                            </Text>
                            <View style={styles.bundleSeparator} />
                        </TouchableOpacity>
                    </View>
                    {mode === 'Advanced' && (
                        <View style={{ width: contentWidth }}>
                            <Text style={[styles.heading, style.defaultTextColor]}>{t('addresses')}:</Text>
                            <ScrollView
                                scrollEnabled={addressesScrollable}
                                showsVerticalScrollIndicator={addressesScrollable}
                                style={{
                                    maxHeight: height / 5 + height / 75,
                                    width: contentWidth,
                                }}
                                onContentSizeChange={(x, y) => this.setAddressesScrollable(y)}
                            >
                                {this.renderAddresses()}
                            </ScrollView>
                        </View>
                    )}
                    <Text style={[styles.heading, style.defaultTextColor]}>{t('send:message')}:</Text>
                    <ScrollView
                        scrollEnabled={messagesScrollable}
                        showsVerticalScrollIndicator={messagesScrollable}
                        style={{
                            maxHeight: height / 9.5,
                            width: contentWidth,
                        }}
                        onContentSizeChange={(x, y) => this.setMessagesScrollable(y)}
                    >
                        <View style={{ width: contentWidth }}>
                            <TouchableOpacity onPress={() => this.copy(message, 'message')}>
                                <Text style={[styles.messageText, style.defaultTextColor]}>{message}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
                <View style={{ flex: 3 }} />
            </ModalView>
        );
    }
}
