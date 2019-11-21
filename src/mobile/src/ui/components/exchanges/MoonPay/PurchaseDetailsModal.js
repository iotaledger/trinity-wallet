import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Linking, Clipboard, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { formatModalTime } from 'shared-modules/libs/date';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import ModalView from 'ui/components/ModalView';
import { locale, timezone } from 'libs/device';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import { getCurrencySymbol } from 'shared-modules/libs/currency';
import { getPurchaseFailureReason } from 'shared-modules/exchanges/MoonPay/utils';

const contentWidth = width - width / 10;

const styles = StyleSheet.create({
    content: {
        width: contentWidth,
        alignItems: 'flex-start',
        flex: 1,
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize6,
        paddingBottom: height / 100,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unitText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        marginTop: height / 100,
        paddingBottom: height / 100,
    },
    wrapper: {
        alignItems: 'center',
        marginBottom: height / 70,
        width: contentWidth,
    },
    rowWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowInnerWrapper: {
        flex: 5,
    },
    statusText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceCodePro-Medium',
        fontSize: Styling.fontSize2,
        marginTop: 2,
    },
    rowText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceCodePro-Medium',
        fontSize: Styling.fontSize2,
        marginTop: 2,
        width: width / 1.4,
    },
    timestamp: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
    },
    label: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        paddingBottom: height / 300,
    },
    addressRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 2,
    },
    addressRowTopWrapper: {
        flex: 4.7,
    },
    addressRowText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceCodePro-Medium',
        fontSize: Styling.fontSize1,
        textAlign: 'left',
        width: width / 1.4,
        height: height / 20,
    },
    rowContainer: {
        paddingVertical: height / 70,
    },
});

/** Purchase details modal */
export default class PurchaseDetailsModal extends PureComponent {
    static propTypes = {
        /** @ignore */
        authorize: PropTypes.func.isRequired,
        /** Container element press event callback function */
        hideModal: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** Transaction value */
        value: PropTypes.number.isRequired,
        /** @ignore */
        fee: PropTypes.number.isRequired,
        /** Wallet address (where the funds were transferred to) */
        address: PropTypes.string.isRequired,
        /** @ignore */
        statusText: PropTypes.string.isRequired,
        /** @ignore */
        shouldDisplayAuthorizationOption: PropTypes.bool.isRequired,
        /** IOTA unit */
        unit: PropTypes.string.isRequired,
        /** Purchase time */
        time: PropTypes.string.isRequired,
        /** Transaction bundle hash */
        bundle: PropTypes.string,
        /** Transaction currency code */
        currencyCode: PropTypes.string.isRequired,
        /** Transaction currency code */
        fiatValue: PropTypes.number.isRequired,
        /** Transaction failure reason */
        failureReason: PropTypes.string,
        /** Content styles */
        style: PropTypes.shape({
            backgroundColor: PropTypes.string.isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            titleColor: PropTypes.string.isRequired,
            containerBackgroundColor: PropTypes.shape({ backgroundColor: PropTypes.string.isRequired }).isRequired,
            rowTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            primaryColor: PropTypes.string.isRequired,
        }).isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('HistoryModalContent');
    }

    /**
     * Generates alert when item is copied
     *
     * @method copy
     *
     * @param {string} item
     * @param {string} type
     */
    copy(item, type) {
        const { t } = this.props;

        const types = {
            bundle: [t('bundleHashCopied'), t('bundleHashCopiedExplanation')],
            address: [t('addressCopied'), t('addressCopiedExplanation')],
        };

        Clipboard.setString(item);

        if (types[type]) {
            this.props.generateAlert('success', ...types[type]);
        }
    }

    /**
     * Renders address row
     *
     * @method renderAddressRow
     *
     * @param {string} address
     *
     * @returns {object}
     */
    renderAddressRow(address) {
        const { style } = this.props;

        return (
            <View style={styles.addressRowContainer}>
                <TouchableOpacity onPress={() => this.copy(address, 'address')} style={styles.addressRowTopWrapper}>
                    <Text
                        numberOfLines={2}
                        ellipsizeMode="middle"
                        style={[styles.addressRowText, style.defaultTextColor]}
                    >
                        {address}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    /**
     * Renders dual footer buttons
     *
     * @method renderDualFooterButtons
     *
     * @returns {object}
     */
    renderDualFooterButtons() {
        const { authorize, t, hideModal } = this.props;

        const props = {
            onLeftButtonPress: () => {
                hideModal();
            },
            onRightButtonPress: () => {
                authorize();
            },
            leftButtonText: t('global:close'),
            rightButtonText: t('moonpay:authorize'),
        };

        return <DualFooterButtons {...props} />;
    }

    render() {
        const {
            shouldDisplayAuthorizationOption,
            statusText,
            failureReason,
            currencyCode,
            address,
            hideModal,
            bundle,
            fee,
            value,
            unit,
            time,
            t,
            style,
            fiatValue
        } = this.props;

        return (
            <ModalView
                modalButtons={
                    shouldDisplayAuthorizationOption ? (
                        this.renderDualFooterButtons()
                    ) : (
                        <SingleFooterButton onButtonPress={hideModal} buttonText={t('close')} />
                    )
                }
                displayTopBar
            >
                <View style={styles.content}>
                    <View style={{ flex: 1 }} />
                    <View style={styles.wrapper}>
                        <View style={styles.header}>
                            <Text style={[styles.headerText, { color: style.titleColor }]}>
                                {t('moonpay:purchase')} {value} {unit}
                            </Text>
                        </View>
                        <Text style={[styles.timestamp, style.defaultTextColor]}>
                            {' '}
                            {formatModalTime(locale, timezone, time)}
                        </Text>
                    </View>
                    <View style={[ styles.rowContainer, { paddingTop: height / 50 } ]}>
                        <Text style={[styles.label, style.defaultTextColor]}>{t('moonpay:paymentStatus')}:</Text>
                        <View style={styles.rowWrapper}>
                            <Text
                                style={[styles.statusText, style.defaultTextColor]}
                                numberOfLines={2}
                                ellipsizeMode="middle"
                            >
                                {statusText}{failureReason && (': ' + getPurchaseFailureReason(failureReason))}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.rowContainer}>
                        <Text style={[styles.label, style.defaultTextColor]}>{t('moonpay:purchaseAmount')}:</Text>
                        <View style={styles.rowWrapper}>
                            <Text
                                style={[styles.rowText, style.defaultTextColor]}
                                numberOfLines={2}
                                ellipsizeMode="middle"
                            >
                                {getCurrencySymbol(currencyCode)}
                                {(fiatValue + fee).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.rowContainer}>
                        <Text style={[styles.label, style.defaultTextColor]}>{t('bundleHash')}:</Text>
                        <View style={styles.rowWrapper}>
                            <TouchableOpacity
                                onPress={() => bundle && this.copy(bundle, 'bundle')}
                                style={styles.rowInnerWrapper}
                            >
                                <Text
                                    style={[styles.rowText, style.defaultTextColor]}
                                    numberOfLines={2}
                                    ellipsizeMode="middle"
                                >
                                    {bundle ? bundle : t('moonpay:awaitingIOTATransaction')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.rowContainer}>
                        <Text style={[styles.label, style.defaultTextColor]}>{t('address')}:</Text>
                        <View style={styles.rowWrapper}>
                            <TouchableOpacity
                                onPress={() => this.copy(address, 'address')}
                                style={styles.rowInnerWrapper}
                            >
                                <Text
                                    style={[styles.rowText, style.defaultTextColor]}
                                    numberOfLines={2}
                                    ellipsizeMode="middle"
                                >
                                    {address}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.rowContainer}>
                        <Text style={[styles.label, style.defaultTextColor]}>{t('moonpay:help')}</Text>
                        <TouchableOpacity
                                onPress={() => Linking.openURL('https://help.moonpay.io/')}
                        >
                            <Text
                                style={[styles.rowText, style.defaultTextColor, { textDecorationLine: 'underline' }]}
                                numberOfLines={2}
                                ellipsizeMode="middle"
                            >
                                {t('moonpay:faq')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1 }} />
                </View>
            </ModalView>
        );
    }
}
