import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
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
    getPaymentCardBrand,
    getPaymentCardLastDigits,
    getActiveTransaction,
} from 'shared-modules/selectors/exchanges/MoonPay';
import { createTransaction } from 'shared-modules/actions/exchanges/MoonPay';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getCurrencySymbol } from 'shared-modules/libs/currency';
import { ALLOWED_IOTA_DENOMINATIONS } from 'shared-modules/exchanges/MoonPay/index';
import navigator from 'libs/navigation';
import { getActiveFiatCurrency, getAmountInFiat, convertFiatCurrency } from 'shared-modules/exchanges/MoonPay/utils';
import InfoBox from 'ui/components/InfoBox';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import WithUserActivity from 'ui/components/UserActivity';
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

export default function withPurchaseSummary(WrappedComponent) {
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
            /** @ignore */
            activeTransaction: PropTypes.object,
            /** @ignore */
            generateAlert: PropTypes.func.isRequired,
        };

        constructor(props) {
            super(props);

            this.createTransaction = this.createTransaction.bind(this);
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

            if (includes(ALLOWED_IOTA_DENOMINATIONS, denomination)) {
                return amount ? `${amount} Mi` : '0 Mi';
            }

            return amount
                ? `${(Number(amount) / exchangeRates[getActiveFiatCurrency(denomination)]).toFixed(2)} Mi`
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
            const activeFiatCurrency = getActiveFiatCurrency(denomination);

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

            const purchaseAmount = convertFiatCurrency(
                getAmountInFiat(Number(amount), denomination, exchangeRates),
                exchangeRates,
                denomination,
                // Convert to currency code set by user (not in the app) but what it is set on MoonPay servers
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
                    Number(getAmountInFiat(Number(amount), denomination, exchangeRates).toFixed(2)),
                    toLower(getActiveFiatCurrency(denomination)),
                    address,
                );
            }
        }
        renderChildren(config) {
            const {
                amount,
                address,
                brand,
                denomination,
                lastDigits,
                fee,
                totalAmount,
                exchangeRates,
                expiryInfo,
                t,
                theme,
                activeTransaction,
            } = this.props;

            const textColor = { color: theme.body.color };

            const receiveAmount = this.getReceiveAmount();
            const activeFiatCurrency = getActiveFiatCurrency(denomination);
            return (
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
                            <Text style={[styles.infoTextLight, textColor]}>
                                {isEmpty(activeTransaction) ? address : activeTransaction.walletAddress}
                            </Text>
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
                            <Text style={[styles.infoTextLight, textColor]}>{t('moonpay:cardExpiry')}</Text>
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
                            <Text style={[styles.infoTextLight, textColor]}>{t('moonpay:youWillReceive')}</Text>
                            <Text style={[styles.infoTextLight, textColor]}>{receiveAmount}</Text>
                        </View>
                        <View style={styles.summaryRowContainer}>
                            <Text style={[styles.infoTextLight, textColor]}>
                                {t('moonpay:marketPrice')}: {receiveAmount} @{' '}
                                {getCurrencySymbol(activeFiatCurrency)}
                                {exchangeRates[activeFiatCurrency]}
                            </Text>
                            <Text style={[styles.infoTextLight, textColor]}>
                                {this.getStringifiedFiatAmount(
                                    getAmountInFiat(Number(amount), denomination, exchangeRates),
                                )}
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
            );
        }


        render() {
            const {
                isCreatingTransaction,
                hasErrorCreatingTransaction,
                t,
                theme,
                componentId,
                activeTransaction,
                generateAlert,
            } = this.props;

            return (
                <WrappedComponent
                    t={t}
                    activeTransaction={activeTransaction}
                    createTransaction={this.createTransaction}
                    isCreatingTransaction={isCreatingTransaction}
                    hasErrorCreatingTransaction={hasErrorCreatingTransaction}
                    theme={theme}
                    componentId={componentId}
                    generateAlert={generateAlert}
                    renderChildren={(config) => this.renderChildren(config)}
                />
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
        brand: getPaymentCardBrand(state),
        lastDigits: getPaymentCardLastDigits(state),
        expiryInfo: getPaymentCardExpiryInfo(state),
        isCreatingTransaction: state.exchanges.moonpay.isCreatingTransaction,
        hasErrorCreatingTransaction: state.exchanges.moonpay.hasErrorCreatingTransaction,
        dailyLimits: getCustomerDailyLimits(state),
        monthlyLimits: getCustomerMonthlyLimits(state),
        defaultCurrencyCode: getDefaultCurrencyCode(state),
        hasCompletedAdvancedIdentityVerification: hasCompletedAdvancedIdentityVerification(state),
        isPurchaseLimitIncreaseAllowed: isLimitIncreaseAllowed(state),
        activeTransaction: getActiveTransaction(state),
    });

    const mapDispatchToProps = {
        createTransaction,
        generateAlert,
    };

    return WithUserActivity()(
        withTranslation()(
            connect(
                mapStateToProps,
                mapDispatchToProps,
            )(PurchaseSummary),
        ),
    );
}
