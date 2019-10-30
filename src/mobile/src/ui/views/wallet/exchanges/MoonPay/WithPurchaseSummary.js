import includes from 'lodash/includes';
import toLower from 'lodash/toLower';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { getLatestAddressForMoonPaySelectedAccount } from 'shared-modules/selectors/accounts';
import {
    getMoonPayFee,
    getTotalPurchaseAmount,
    getCustomerDailyLimits,
    getCustomerMonthlyLimits,
    getDefaultCurrencyCode,
    hasCompletedAdvancedIdentityVerification,
    isLimitIncreaseAllowed,
    getPaymentCardExpiryInfo,
} from 'shared-modules/selectors/exchanges/MoonPay';
import { createTransaction } from 'shared-modules/actions/exchanges/MoonPay';
import { getCurrencySymbol } from 'shared-modules/libs/currency';
import navigator from 'libs/navigation';
import { convertCurrency } from 'shared-modules/exchanges/MoonPay/utils';
import InfoBox from 'ui/components/InfoBox';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import AnimatedComponent from 'ui/components/AnimatedComponent';

const styles = StyleSheet.create({
    container: {
        flex: 3.1,
        alignItems: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
    },
    summaryRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: width / 1.2,
    },
});

export default function withPurchaseSummary(WrappedComponent, config) {
    /** MoonPay purchase summary screen component */
    class PurchaseSummary extends Component {
        static propTypes = {
            /** @ignore */
            t: PropTypes.func.isRequired,
            /** @ignore */
            theme: PropTypes.object.isRequired,
            /** @ignore */
            amount: PropTypes.string.isRequired,
            /** @ignore */
            denomination: PropTypes.string.isRequired,
            /** @ignore */
            exchangeRates: PropTypes.object.isRequired,
            /** @ignore */
            fee: PropTypes.number.isRequired,
            /** @ignore */
            totalAmount: PropTypes.number.isRequired,
            /** @ignore */
            address: PropTypes.string.isRequired,
            /** @ignore */
            brand: PropTypes.string.isRequired,
            /** @ignore */
            lastDigits: PropTypes.string.isRequired,
            /** @ignore */
            isCreatingTransaction: PropTypes.bool.isRequired,
            /** @ignore */
            hasErrorCreatingTransaction: PropTypes.bool.isRequired,
            /** @ignore */
            dailyLimits: PropTypes.object.isRequired,
            /** @ignore */
            monthlyLimits: PropTypes.object.isRequired,
            /** @ignore */
            defaultCurrencyCode: PropTypes.string.isRequired,
            /** @ignore */
            expiryInfo: PropTypes.string.isRequired,
            /** @ignore */
            hasCompletedAdvancedIdentityVerification: PropTypes.bool.isRequired,
            /** @ignore */
            isPurchaseLimitIncreaseAllowed: PropTypes.bool.isRequired,
            /** @ignore */
            createTransaction: PropTypes.func.isRequired,
            /** Component ID */
            componentId: PropTypes.string.isRequired,
        };

        static iotaDenominations = ['Mi'];

        constructor(props) {
            super(props);

            this.createTransaction = this.createTransaction.bind(this);
        }

        /**
         * Gets active fiat currency.
         *
         * @method getActiveFiatCurrency
         *
         * @param {string}
         *
         * @returns {string}
         */
        getActiveFiatCurrency(denomination) {
            if (includes(PurchaseSummary.iotaDenominations, denomination)) {
                // Default to USD since we don't allow user to set a default currency.
                return 'USD';
            }

            return denomination;
        }

        /**
         * Gets amount in fiat
         *
         * @method getAmountInFiat
         *
         * @param {string} amount
         * @param {string} denomination
         *
         * @returns {number}
         */
        getAmountInFiat(amount, denomination) {
            const { exchangeRates } = this.props;

            if (includes(PurchaseSummary.iotaDenominations, denomination)) {
                return amount
                    ? Number((Number(amount) * exchangeRates[this.getActiveFiatCurrency(denomination)]).toFixed(2))
                    : 0;
            }

            return amount ? Number(Number(amount).toFixed(2)) : 0;
        }

        /**
         * Gets amount in Miota
         *
         * @method getAmountinMiota
         *
         * @returns {string}
         */
        getAmountinMiota() {
            const { amount, denomination, exchangeRates } = this.props;

            if (!amount) {
                return '0 Mi';
            }

            return `${(Number(amount) / exchangeRates[this.getActiveFiatCurrency(denomination)]).toFixed(2)} Mi`;
        }

        /**
         * Gets receive amount
         *
         * @method getReceiveAmount
         *
         * @returns {string}
         */
        getReceiveAmount() {
            const { amount, denomination, exchangeRates } = this.props;

            if (includes(PurchaseSummary.iotaDenominations, denomination)) {
                return amount ? `${amount} Mi` : '0 Mi';
            }

            return amount
                ? `${(Number(amount) / exchangeRates[this.getActiveFiatCurrency(denomination)]).toFixed(2)} Mi`
                : '0 Mi';
        }

        /**
         * Gets stringified amount in fiat
         *
         * @method getStringifiedFiatAmount
         *
         * @param {number} amount
         *
         * @returns {string}
         */
        getStringifiedFiatAmount(amount) {
            const { denomination } = this.props;
            const activeFiatCurrency = this.getActiveFiatCurrency(denomination);

            return amount
                ? `${getCurrencySymbol(activeFiatCurrency)}${amount.toFixed(2)}`
                : `${getCurrencySymbol(activeFiatCurrency)}0`;
        }

        /**
         * Navigates to chosen screen
         *
         * @method redirectToScreen
         */
        redirectToScreen(screen) {
            navigator.push(screen);
        }

        /**
         * Creates transaction
         *
         * @method createTransaction
         *
         * @returns {void}
         */
        createTransaction() {
            const {
                amount,
                exchangeRates,
                defaultCurrencyCode,
                dailyLimits,
                monthlyLimits,
                denomination,
                address,
                isPurchaseLimitIncreaseAllowed,
                hasCompletedAdvancedIdentityVerification,
            } = this.props;

            const purchaseAmount = convertCurrency(
                this.getAmountInFiat(amount, denomination),
                exchangeRates,
                denomination,
                defaultCurrencyCode,
            );

            if (
                isPurchaseLimitIncreaseAllowed &&
                !hasCompletedAdvancedIdentityVerification &&
                (purchaseAmount > dailyLimits.dailyLimitRemaining ||
                    purchaseAmount > monthlyLimits.monthlyLimitRemaining)
            ) {
                this.redirectToScreen('identityConfirmationWarning');
            } else {
                this.props.createTransaction(
                    this.getAmountInFiat(amount, denomination),
                    toLower(this.getActiveFiatCurrency(denomination)),
                    address,
                );
            }
        }

        render() {
            const {
                isCreatingTransaction,
                hasErrorCreatingTransaction,
                amount,
                address,
                brand,
                denomination,
                lastDigits,
                fee,
                totalAmount,
                t,
                theme,
                exchangeRates,
                expiryInfo,
                componentId,
            } = this.props;

            const textColor = { color: theme.body.color };

            const receiveAmount = this.getReceiveAmount();
            const activeFiatCurrency = this.getActiveFiatCurrency(denomination);

            return (
                <WrappedComponent
                    t={t}
                    createTransaction={this.createTransaction}
                    isCreatingTransaction={isCreatingTransaction}
                    hasErrorCreatingTransaction={hasErrorCreatingTransaction}
                    theme={theme}
                    componentId={componentId}
                >
                    <View style={styles.container}>
                        <View style={{ flex: 0.2 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={350}
                        >
                            <InfoBox>
                                <Text style={[styles.infoText, textColor]}>{t(config.header)}</Text>
                                <Text
                                    style={[
                                        styles.infoTextRegular,
                                        textColor,
                                        { paddingTop: height / 60, textAlign: 'center' },
                                    ]}
                                >
                                    {t(config.subtitle)}
                                </Text>
                            </InfoBox>
                        </AnimatedComponent>
                        <View style={{ flex: 0.3 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={300}
                        >
                            <View style={styles.summaryRowContainer}>
                                <Text style={[styles.infoTextRegular, textColor, { fontSize: Styling.fontSize5 }]}>
                                    {t('moonpay:order')}
                                </Text>
                                <Text style={[styles.infoTextBold, textColor, { fontSize: Styling.fontSize5 }]}>
                                    {receiveAmount}
                                </Text>
                            </View>
                        </AnimatedComponent>
                        <View style={{ flex: 0.4 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={250}
                        >
                            <View style={styles.summaryRowContainer}>
                                <Text style={[styles.infoTextRegular, textColor]}>
                                    {t('moonpay:trinityWalletAddress')}
                                </Text>
                            </View>
                        </AnimatedComponent>
                        <View style={{ flex: 0.1 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={200}
                        >
                            <View style={styles.summaryRowContainer}>
                                <Text style={[styles.infoTextLight, textColor]}>{address}</Text>
                            </View>
                        </AnimatedComponent>
                        <View style={{ flex: 0.4 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={150}
                        >
                            <View style={styles.summaryRowContainer}>
                                <Text style={[styles.infoTextLight, textColor]}>
                                    {t('moonpay:debitCard', { brand })}
                                </Text>
                                <Text style={[styles.infoTextLight, textColor]}>**** **** **** {lastDigits}</Text>
                            </View>
                        </AnimatedComponent>
                        <View style={{ flex: 0.05 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={100}
                        >
                            <View style={styles.summaryRowContainer}>
                                <Text style={[styles.infoTextLight, textColor]}>
                                    {t('moonpay:cardExpiry', { brand: 'Visa' })}
                                </Text>
                                <Text style={[styles.infoTextLight, textColor]}>{expiryInfo}</Text>
                            </View>
                        </AnimatedComponent>
                        <View style={{ flex: 0.4 }} />

                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={50}
                        >
                            <View style={styles.summaryRowContainer}>
                                <Text style={[styles.infoTextLight, textColor]}>You will receive</Text>
                                <Text style={[styles.infoTextLight, textColor]}>{receiveAmount}</Text>
                            </View>
                            <View style={styles.summaryRowContainer}>
                                <Text style={[styles.infoTextLight, textColor]}>
                                    {t('moonpay:marketPrice')}: {receiveAmount} @{' '}
                                    {getCurrencySymbol(activeFiatCurrency)}
                                    {exchangeRates[activeFiatCurrency]}
                                </Text>
                                <Text style={[styles.infoTextLight, textColor]}>
                                    {this.getStringifiedFiatAmount(this.getAmountInFiat(amount, denomination))}
                                </Text>
                            </View>
                            <View style={{ flex: 0.05 }} />
                            <View style={styles.summaryRowContainer}>
                                <Text style={[styles.infoTextLight, textColor]}>{t('moonpay:moonpayFee')}</Text>
                                <Text style={[styles.infoTextLight, textColor]}>
                                    {getCurrencySymbol(activeFiatCurrency)}
                                    {fee}
                                </Text>
                            </View>
                            <View style={{ flex: 0.4 }} />
                            <View style={styles.summaryRowContainer}>
                                <Text style={[styles.infoTextRegular, textColor, { fontSize: Styling.fontSize5 }]}>
                                    {t('global:total')}
                                </Text>
                                <Text style={[styles.infoTextBold, textColor, { fontSize: Styling.fontSize5 }]}>
                                    {getCurrencySymbol(activeFiatCurrency)}
                                    {totalAmount}
                                </Text>
                            </View>
                        </AnimatedComponent>
                        <View style={{ flex: 0.3 }} />
                    </View>
                </WrappedComponent>
            );
        }
    }

    const mapStateToProps = (state) => ({
        theme: getThemeFromState(state),
        amount: state.exchanges.moonpay.amount,
        denomination: state.exchanges.moonpay.denomination,
        exchangeRates: state.exchanges.moonpay.exchangeRates,
        fee: getMoonPayFee(state),
        totalAmount: getTotalPurchaseAmount(state),
        address: getLatestAddressForMoonPaySelectedAccount(state),
        brand: state.exchanges.moonpay.paymentCardInfo.brand,
        lastDigits: state.exchanges.moonpay.paymentCardInfo.lastDigits,
        expiryInfo: getPaymentCardExpiryInfo(state),
        isCreatingTransaction: state.exchanges.moonpay.isCreatingTransaction,
        hasErrorCreatingTransaction: state.exchanges.moonpay.hasErrorCreatingTransaction,
        dailyLimits: getCustomerDailyLimits(state),
        monthlyLimits: getCustomerMonthlyLimits(state),
        defaultCurrencyCode: getDefaultCurrencyCode(state),
        hasCompletedAdvancedIdentityVerification: hasCompletedAdvancedIdentityVerification(state),
        isPurchaseLimitIncreaseAllowed: isLimitIncreaseAllowed(state),
    });

    const mapDispatchToProps = {
        createTransaction,
    };

    return withTranslation()(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(PurchaseSummary),
    );
}
