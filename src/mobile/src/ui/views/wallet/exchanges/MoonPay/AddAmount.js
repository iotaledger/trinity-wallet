import get from 'lodash/get';
import head from 'lodash/head';
import includes from 'lodash/includes';
import map from 'lodash/map';
import toUpper from 'lodash/toUpper';
import toLower from 'lodash/toLower';
import size from 'lodash/size';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { StyleSheet, KeyboardAvoidingView, View, Text } from 'react-native';
import { connect } from 'react-redux';
import {
    ALLOWED_IOTA_DENOMINATIONS,
    MINIMUM_TRANSACTION_SIZE,
    MAXIMUM_TRANSACTION_SIZE,
    BASIC_MONTHLY_LIMIT,
} from 'shared-modules/exchanges/MoonPay/index';
import { getActiveFiatCurrency, getAmountInFiat, convertFiatCurrency } from 'shared-modules/exchanges/MoonPay/utils';
import { getThemeFromState } from 'shared-modules/selectors/global';
import {
    hasCompletedBasicIdentityVerification,
    hasCompletedAdvancedIdentityVerification,
    getFiatCurrencies,
    getMoonPayFee,
    getTotalPurchaseAmount,
    isLimitIncreaseAllowed,
    getDefaultCurrencyCode,
    getCustomerDailyLimits,
    getCustomerMonthlyLimits,
    hasStoredAnyPaymentCards,
} from 'shared-modules/selectors/exchanges/MoonPay';
import { fetchQuote, setAmount, setDenomination } from 'shared-modules/actions/exchanges/MoonPay';
import { getCurrencySymbol } from 'shared-modules/libs/currency';
import { generateAlert } from 'shared-modules/actions/alerts';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import CustomTextInput from 'ui/components/CustomTextInput';
import navigator from 'libs/navigation';
import InfoBox from 'ui/components/InfoBox';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import AnimatedComponent from 'ui/components/AnimatedComponent';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 0.9,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3.1,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
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
        textAlign: 'center',
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

/** MoonPay add amount screen component */
class AddAmount extends Component {
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
        fiatCurrencies: PropTypes.array.isRequired,
        /** @ignore */
        exchangeRates: PropTypes.object.isRequired,
        /** @ignore */
        fee: PropTypes.number.isRequired,
        /** @ignore */
        totalAmount: PropTypes.number.isRequired,
        /** @ignore */
        hasCompletedBasicIdentityVerification: PropTypes.bool.isRequired,
        /** @ignore */
        hasCompletedAdvancedIdentityVerification: PropTypes.bool.isRequired,
        /** @ignore */
        isPurchaseLimitIncreaseAllowed: PropTypes.bool.isRequired,
        /** @ignore */
        dailyLimits: PropTypes.object.isRequired,
        /** @ignore */
        monthlyLimits: PropTypes.object.isRequired,
        /** @ignore */
        defaultCurrencyCode: PropTypes.string.isRequired,
        /** @ignore */
        fetchQuote: PropTypes.func.isRequired,
        /** @ignore */
        setAmount: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        setDenomination: PropTypes.func.isRequired,
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        isFetchingCurrencyQuote: PropTypes.bool.isRequired,
        /** @ignore */
        hasAnyPaymentCards: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            /**
             * Determines if latest currency quote should be fetched.
             * We skip fetching currency quote if there is already a network in progress
             * If this flag is turned on, we would automatically fetch the latest currency quote once the previous call is finished
             * */
            shouldGetLatestCurrencyQuote: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isFetchingCurrencyQuote && !nextProps.isFetchingCurrencyQuote) {
            if (this.state.shouldGetLatestCurrencyQuote) {
                this.setState({ shouldGetLatestCurrencyQuote: false });

                const { amount, denomination, exchangeRates } = nextProps;

                this.props.fetchQuote(
                    Number(getAmountInFiat(Number(amount), denomination, exchangeRates).toFixed(2)),
                    toLower(getActiveFiatCurrency(denomination)),
                );
            }
        }
    }

    /**
     * Fetches latest currency quote
     *
     * @method fetchCurrencyQuote
     *
     * @param {string} amount
     * @param {string} denomination
     * @param {object} exchangeRates
     *
     * @returns {void}
     */
    fetchCurrencyQuote(amount, denomination, exchangeRates) {
        const { isFetchingCurrencyQuote } = this.props;

        if (
            // Check if its not already making a network call to fetch quote
            !isFetchingCurrencyQuote
        ) {
            this.props.fetchQuote(
                Number(getAmountInFiat(Number(amount), denomination, exchangeRates).toFixed(2)),
                toLower(getActiveFiatCurrency(denomination)),
            );
        } else {
            // If there is already a network call in progress, turn on shouldGetLatestCurrencyQuote flag
            // Turning this flag on will automatically make a network call as soon as the previous one is finished
            this.setState({ shouldGetLatestCurrencyQuote: true });
        }
    }

    /**
     * Sets next denomination in redux store
     *
     * @method setDenomination
     *
     * @returns {void}
     */
    setDenomination() {
        const { amount, exchangeRates, denomination, fiatCurrencies } = this.props;

        const availableDenominations = [
            ...ALLOWED_IOTA_DENOMINATIONS,
            ...map(fiatCurrencies, (currencyObject) => toUpper(get(currencyObject, 'code'))),
        ];

        const currentDenominationIndex = availableDenominations.indexOf(denomination);

        const nextDenomination =
            currentDenominationIndex === -1 || currentDenominationIndex === size(availableDenominations) - 1
                ? head(availableDenominations)
                : availableDenominations[currentDenominationIndex + 1];

        this.props.setDenomination(nextDenomination);

        this.fetchCurrencyQuote(amount, nextDenomination, exchangeRates);
    }

    /**
     * Gets receive amount
     *
     * @method getReceiveAmount
     *
     * @returns {void}
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
     * Gets currency symbol for currently selected currency
     *
     * @method getCurrencySymbol
     *
     * @returns {string}
     */
    getCurrencySymbol() {
        const { denomination } = this.props;
        return denomination === 'Mi' ? '$' : getCurrencySymbol(denomination);
    }

    /**
     * Gets warning text
     *
     * @method getWarningText
     *
     * @returns {string|object}
     */
    getWarningText() {
        const {
            amount,
            exchangeRates,
            denomination,
            defaultCurrencyCode,
            dailyLimits,
            monthlyLimits,
            hasCompletedBasicIdentityVerification,
            hasCompletedAdvancedIdentityVerification,
            isPurchaseLimitIncreaseAllowed,
            t,
        } = this.props;

        if (amount) {
            const fiatAmount = getAmountInFiat(Number(amount), denomination, exchangeRates);

            if (fiatAmount < MINIMUM_TRANSACTION_SIZE) {
                return t('moonpay:minimumTransactionAmount', { amount: this.getCurrencySymbol() + MINIMUM_TRANSACTION_SIZE });
            }

            if (fiatAmount > MAXIMUM_TRANSACTION_SIZE) {
                return t('moonpay:maximumTransactionAmount', { amount: this.getCurrencySymbol() + MAXIMUM_TRANSACTION_SIZE });
            }

            if (
                !hasCompletedBasicIdentityVerification &&
                !hasCompletedAdvancedIdentityVerification &&
                isPurchaseLimitIncreaseAllowed
            ) {
                return fiatAmount > BASIC_MONTHLY_LIMIT
                    ? t('moonpay:kycRequired', { limit: `€${BASIC_MONTHLY_LIMIT}` })
                    : null;
            } else if (
                hasCompletedBasicIdentityVerification &&
                !hasCompletedAdvancedIdentityVerification &&
                isPurchaseLimitIncreaseAllowed
            ) {
                const purchaseAmount = convertFiatCurrency(
                    fiatAmount,
                    exchangeRates,
                    denomination,
                    // Convert to currency code set by user (not in the app) but what it is set on MoonPay servers
                    defaultCurrencyCode,
                );

                const _getLimit = () => {
                    let limit = null;

                    if (
                        purchaseAmount > dailyLimits.dailyLimitRemaining &&
                        purchaseAmount < monthlyLimits.monthlyLimitRemaining
                    ) {
                        limit = convertFiatCurrency(
                            dailyLimits.dailyLimitRemaining,
                            exchangeRates,
                            defaultCurrencyCode,
                            getActiveFiatCurrency(denomination),
                        );
                    } else if (
                        purchaseAmount > dailyLimits.dailyLimitRemaining &&
                        purchaseAmount > monthlyLimits.monthlyLimitRemaining
                    ) {
                        limit = convertFiatCurrency(
                            monthlyLimits.monthlyLimitRemaining,
                            exchangeRates,
                            defaultCurrencyCode,
                            getActiveFiatCurrency(denomination),
                        );
                    }

                    return limit;
                };

                const limit = _getLimit();

                // limit could be null, so add a null check
                return limit && fiatAmount > limit
                    ? t('moonpay:kycRequired', {
                          limit: `${getCurrencySymbol(getActiveFiatCurrency(denomination))}${limit.toFixed(0)}`,
                      })
                    : null;
            }
        }

        return null;
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
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        navigator.pop(this.props.componentId);
    }

    /**
     * Verifies that amount is above minimum allowed amount ($20)
     *
     * @method verifyAmount
     *
     * @returns {void}
     */
    verifyAmount() {
        const {
            amount,
            exchangeRates,
            dailyLimits,
            monthlyLimits,
            defaultCurrencyCode,
            denomination,
            t,
            hasCompletedBasicIdentityVerification,
            hasCompletedAdvancedIdentityVerification,
            isPurchaseLimitIncreaseAllowed,
            isFetchingCurrencyQuote,
            hasAnyPaymentCards,
        } = this.props;
        const { shouldGetLatestCurrencyQuote } = this.state;

        const fiatAmount = getAmountInFiat(Number(amount), denomination, exchangeRates);

        if (fiatAmount < MINIMUM_TRANSACTION_SIZE) {
            this.props.generateAlert(
                'error',
                t('moonpay:notEnoughAmount'),
                t('moonpay:notEnoughAmountExplanation', { amount: this.getCurrencySymbol() + MINIMUM_TRANSACTION_SIZE }),
            );
        } else if (fiatAmount > MAXIMUM_TRANSACTION_SIZE) {
            this.props.generateAlert(
                'error',
                t('moonpay:amountTooHigh'),
                t('moonpay:amountTooHighExplanation', { amount: this.getCurrencySymbol() + MAXIMUM_TRANSACTION_SIZE }),
            );
        } else {
            if (isFetchingCurrencyQuote || shouldGetLatestCurrencyQuote) {
                this.props.generateAlert('error', t('global:pleaseWait'), t('moonpay:waitForCurrencyQuote'));
            } else {
                const purchaseAmount = convertFiatCurrency(
                    fiatAmount,
                    exchangeRates,
                    denomination,
                    // Convert to currency code set by user (not in the app) but what it is set on MoonPay servers
                    defaultCurrencyCode,
                );

                this.redirectToScreen(
                    // Make sure user has completed basic identity verification
                    // If not, then the daily/monthly limit will default to 0
                    hasCompletedBasicIdentityVerification &&
                        !isPurchaseLimitIncreaseAllowed &&
                        hasCompletedAdvancedIdentityVerification &&
                        (purchaseAmount > dailyLimits.dailyLimitRemaining ||
                            purchaseAmount > monthlyLimits.monthlyLimitRemaining)
                        ? 'purchaseLimitWarning'
                        : hasAnyPaymentCards
                        ? 'selectPaymentCard'
                        : 'userBasicInfo',
                );
            }
        }
    }

    render() {
        const { amount, fee, isFetchingCurrencyQuote, totalAmount, t, theme, denomination, exchangeRates } = this.props;
        const textColor = { color: theme.body.color };

        const receiveAmount = this.getReceiveAmount();
        const activeFiatCurrency = getActiveFiatCurrency(denomination);

        return (
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: theme.body.bg }]}
                behavior="position"
                keyboardVerticalOffset={10}
                enabled
            >
                <View>
                    <View style={styles.topContainer}>
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={400}
                        >
                            <Header iconSize={width / 3} iconName="moonpay" textColor={theme.body.color} />
                        </AnimatedComponent>
                    </View>
                    <View style={styles.midContainer}>
                        <View style={{ flex: 0.2 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={300}
                        >
                            <InfoBox>
                                <Text style={[styles.infoText, textColor]}>{t('moonpay:addAmount')}</Text>
                                <Text style={[styles.infoTextRegular, textColor, { paddingTop: height / 60 }]}>
                                    {t('moonpay:addAmountExplanation')}
                                </Text>
                            </InfoBox>
                        </AnimatedComponent>
                        <View style={{ flex: 0.3 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={200}
                        >
                            <CustomTextInput
                                keyboardType="numeric"
                                label={t('moonpay:enterAmount')}
                                onRef={(c) => {
                                    this.amountField = c;
                                }}
                                onValidTextChange={(newAmount) => {
                                    this.props.setAmount(newAmount);

                                    this.fetchCurrencyQuote(newAmount, denomination, exchangeRates);
                                }}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                widgets={['denomination']}
                                theme={theme}
                                denominationText={denomination}
                                onDenominationPress={() => {
                                    this.setDenomination();
                                }}
                                value={amount}
                            />
                            <View
                                style={[styles.summaryRowContainer, { paddingTop: height / 90, height: height / 25 }]}
                            >
                                <Text style={[styles.infoTextRegular, { color: theme.negative.color }]}>
                                    {this.getWarningText()}
                                </Text>
                            </View>
                        </AnimatedComponent>
                        <View style={{ flex: 0.2 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={100}
                            style={{ flex: 1.5, width: width / 1.2 }}
                        >
                            <View style={styles.summaryRowContainer}>
                                <Text style={[styles.infoTextLight, textColor]}>{t('moonpay:youWillReceive')}</Text>
                                <Text numberOfLines={1} style={[styles.infoTextLight, textColor, { maxWidth: Styling.contentWidth * 0.5}]}>{receiveAmount}</Text>
                            </View>
                            <View style={{ flex: 0.05 }} />
                            <View style={styles.summaryRowContainer}>
                                <Text numberOfLines={1} style={[styles.infoTextLight, textColor, { maxWidth: Styling.contentWidth * 0.4}]}>
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
                            <View style={{ flex: 0.3 }} />
                            <View style={styles.summaryRowContainer}>
                                <Text style={[styles.infoTextRegular, textColor]}>{t('global:total')}</Text>
                                <Text style={[styles.infoTextBold, textColor]}>
                                    {getCurrencySymbol(activeFiatCurrency)}
                                    {totalAmount}
                                </Text>
                            </View>
                        </AnimatedComponent>
                    </View>
                    <View style={styles.bottomContainer}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']}>
                            <DualFooterButtons
                                disableRightButton={isFetchingCurrencyQuote}
                                onLeftButtonPress={() => this.goBack()}
                                onRightButtonPress={() => this.verifyAmount()}
                                leftButtonText={t('global:goBack')}
                                rightButtonText={t('global:continue')}
                                leftButtonTestID="moonpay-landing"
                                rightButtonTestID="moonpay-select-account"
                            />
                        </AnimatedComponent>
                    </View>
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    amount: state.exchanges.moonpay.amount,
    denomination: state.exchanges.moonpay.denomination,
    fiatCurrencies: getFiatCurrencies(state),
    exchangeRates: state.exchanges.moonpay.exchangeRates,
    fee: getMoonPayFee(state),
    totalAmount: getTotalPurchaseAmount(state),
    hasCompletedBasicIdentityVerification: hasCompletedBasicIdentityVerification(state),
    hasCompletedAdvancedIdentityVerification: hasCompletedAdvancedIdentityVerification(state),
    isPurchaseLimitIncreaseAllowed: isLimitIncreaseAllowed(state),
    dailyLimits: getCustomerDailyLimits(state),
    monthlyLimits: getCustomerMonthlyLimits(state),
    defaultCurrencyCode: getDefaultCurrencyCode(state),
    isFetchingCurrencyQuote: state.exchanges.moonpay.isFetchingCurrencyQuote,
    hasAnyPaymentCards: hasStoredAnyPaymentCards(state),
});

const mapDispatchToProps = {
    generateAlert,
    fetchQuote,
    setAmount,
    setDenomination,
};

export default withTranslation()(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(AddAmount),
);
