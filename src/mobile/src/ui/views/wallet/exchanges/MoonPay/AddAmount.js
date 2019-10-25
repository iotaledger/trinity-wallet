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
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { BASIC_MONTHLY_LIMIT, MINIMUM_TRANSACTION_SIZE } from 'shared-modules/exchanges/MoonPay/index';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { getFiatCurrencies, getMoonPayFee, getTotalPurchaseAmount } from 'shared-modules/selectors/exchanges/MoonPay';
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
        fetchQuote: PropTypes.func.isRequired,
        /** @ignore */
        setAmount: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        setDenomination: PropTypes.func.isRequired,
    };

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    static redirectToScreen(screen) {
        navigator.push(screen);
    }

    static iotaDenominations = ['Mi'];

    /**
     * Sets next denomination in redux store
     *
     * @method setDenomination
     *
     * @returns {void}
     */
    setDenomination() {
        const { amount, denomination, fiatCurrencies } = this.props;

        const availableDenominations = [
            ...AddAmount.iotaDenominations,
            ...map(fiatCurrencies, (currencyObject) => toUpper(get(currencyObject, 'code'))),
        ];

        const currentDenominationIndex = availableDenominations.indexOf(denomination);

        const nextDenomination =
            currentDenominationIndex === -1 || currentDenominationIndex === size(availableDenominations) - 1
                ? head(availableDenominations)
                : availableDenominations[currentDenominationIndex + 1];

        this.props.setDenomination(nextDenomination);
        this.props.fetchQuote(
            this.getAmountInFiat(amount, nextDenomination),
            this.getActiveFiatCurrency(toLower(this.getActiveFiatCurrency(nextDenomination))),
        );
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
        if (includes(AddAmount.iotaDenominations, denomination)) {
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

        if (includes(AddAmount.iotaDenominations, denomination)) {
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
     * @returns {void}
     */
    getReceiveAmount() {
        const { amount, denomination, exchangeRates } = this.props;

        if (includes(AddAmount.iotaDenominations, denomination)) {
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
     * Gets warning text
     *
     * @method getWarningText
     *
     * @returns {string|object}
     */
    getWarningText() {
        const { amount, denomination, t } = this.props;

        const fiatAmount = this.getAmountInFiat(amount, denomination);

        if (amount && fiatAmount < MINIMUM_TRANSACTION_SIZE) {
            return t('moonpay:minimumTransactionAmount', { amount: `$${MINIMUM_TRANSACTION_SIZE}` });
        }

        if (fiatAmount > BASIC_MONTHLY_LIMIT) {
            return t('moonpay:kycRequired', { amount: `$${BASIC_MONTHLY_LIMIT}` });
        }

        return null;
    }

    /**
     * Verifies that amount is above minimum allowed amount ($20)
     *
     * @method verifyAmount
     *
     * @returns {void}
     */
    verifyAmount() {
        const { amount, denomination, t } = this.props;

        const fiatAmount = this.getAmountInFiat(amount, denomination);

        if (fiatAmount < MINIMUM_TRANSACTION_SIZE) {
            this.props.generateAlert(
                'error',
                t('moonpay:notEnoughAmount'),
                t('moonpay:notEnoughAmountExplanation', { amount: `$${MINIMUM_TRANSACTION_SIZE}` }),
            );
        } else {
            AddAmount.redirectToScreen('selectAccount');
        }
    }

    render() {
        const { amount, fee, totalAmount, t, theme, denomination, exchangeRates } = this.props;
        const textColor = { color: theme.body.color };

        const receiveAmount = this.getReceiveAmount();
        const activeFiatCurrency = this.getActiveFiatCurrency(denomination);

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
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

                                // TODO: Do validation on amount
                                this.props.fetchQuote(
                                    this.getAmountInFiat(newAmount, denomination),
                                    toLower(activeFiatCurrency),
                                );
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
                        <View style={[styles.summaryRowContainer, { paddingTop: height / 90 }]}>
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
                            <Text style={[styles.infoTextLight, textColor]}>{receiveAmount}</Text>
                        </View>
                        <View style={{ flex: 0.05 }} />
                        <View style={styles.summaryRowContainer}>
                            <Text style={[styles.infoTextLight, textColor]}>
                                {t('moonpay:marketPrice')}: {receiveAmount} @ {getCurrencySymbol(activeFiatCurrency)}
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
                            onLeftButtonPress={() => AddAmount.redirectToScreen('landing')}
                            onRightButtonPress={() => this.verifyAmount()}
                            leftButtonText={t('global:goBack')}
                            rightButtonText={t('global:purchase')}
                            leftButtonTestID="moonpay-landing"
                            rightButtonTestID="moonpay-select-account"
                        />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    themeName: state.settings.themeName,
    amount: state.exchanges.moonpay.amount,
    denomination: state.exchanges.moonpay.denomination,
    fiatCurrencies: getFiatCurrencies(state),
    exchangeRates: state.exchanges.moonpay.exchangeRates,
    fee: getMoonPayFee(state),
    totalAmount: getTotalPurchaseAmount(state),
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
