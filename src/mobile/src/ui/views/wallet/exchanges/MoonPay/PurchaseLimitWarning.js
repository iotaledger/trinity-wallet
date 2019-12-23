import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import {
    getCustomerDailyLimits,
    getCustomerMonthlyLimits,
    getMostRecentTransaction,
    getDefaultCurrencyCode,
} from 'shared-modules/selectors/exchanges/MoonPay';
import { getAmountInFiat, convertFiatCurrency } from 'shared-modules/exchanges/MoonPay/utils';
import navigator from 'libs/navigation';
import { moment } from 'shared-modules/libs/exports';
import DualFooterButtons from 'ui/components/DualFooterButtons';
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
        textAlign: 'center',
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
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Regular',
        textAlign: 'center',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
});

/** MoonPay purchase limit screen component */
class PurchaseLimitWarning extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        dailyLimits: PropTypes.object.isRequired,
        /** @ignore */
        monthlyLimits: PropTypes.object.isRequired,
        /** @ignore */
        amount: PropTypes.string.isRequired,
        /** @ignore */
        denomination: PropTypes.string.isRequired,
        /** @ignore */
        exchangeRates: PropTypes.object.isRequired,
        /** @ignore */
        defaultCurrencyCode: PropTypes.string.isRequired,
        /** @ignore */
        mostRecentTransaction: PropTypes.object.isRequired,
        /** Component ID */
        componentId: PropTypes.string.isRequired,
    };

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    redirectToHome() {
        navigator.setStackRoot('home');
    }

    /**
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        navigator.pop(this.props.componentId);
    }

    render() {
        const {
            t,
            theme: { body },
            amount,
            denomination,
            exchangeRates,
            defaultCurrencyCode,
            dailyLimits,
            monthlyLimits,
            mostRecentTransaction,
        } = this.props;
        const textColor = { color: body.color };

        const purchaseAmount = convertFiatCurrency(
            getAmountInFiat(Number(amount), denomination, exchangeRates),
            exchangeRates,
            denomination,
            // Convert to currency code set by user (not in the app) but what it is set on MoonPay servers
            defaultCurrencyCode,
        );

        const { createdAt } = mostRecentTransaction;
        const oneDayFromCreatedAt = moment(createdAt).add(1, 'days');
        const oneMonthFromCreatedAt = moment(createdAt).add(1, 'months');
        const exceedsDaily = purchaseAmount > dailyLimits.dailyLimitRemaining && purchaseAmount < monthlyLimits.monthlyLimitRemaining;

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topContainer}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={400}
                    >
                        <Header iconSize={width / 3} iconName="moonpay" textColor={body.color} />
                    </AnimatedComponent>
                </View>
                <View style={styles.midContainer}>
                    <View style={{ flex: 0.4 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={200}
                    >
                        <InfoBox>
                            <Text style={[styles.infoText, textColor]}>{t('moonpay:limitExceeded')}</Text>
                            <Text style={[styles.infoTextRegular, textColor, { paddingTop: height / 30 }]}>
                                {t('moonpay:limitExceededExplanation', {
                                    amount: exceedsDaily ? '€2000' : '€10000',
                                    limitBracket: exceedsDaily ? 'day' : 'month',
                                })}
                            </Text>
                            <Text style={[styles.infoTextRegular, textColor, { paddingTop: height / 30 }]}>
                                {t('moonpay:limitResetExplanation', {
                                    time:
                                        exceedsDaily
                                            ? oneDayFromCreatedAt.format('hh:mm')
                                            : oneMonthFromCreatedAt.format('hh:mm'),
                                    date:
                                        exceedsDaily
                                            ? oneDayFromCreatedAt.format('Do MMM YYYY')
                                            : oneMonthFromCreatedAt.format('Do MMM YYYY'),
                                })}
                            </Text>
                        </InfoBox>
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']}>
                        <DualFooterButtons
                            onLeftButtonPress={() => this.goBack()}
                            onRightButtonPress={() => this.redirectToHome('home')}
                            leftButtonText={t('global:goBack')}
                            rightButtonText={t('global:cancel')}
                            leftButtonTestID="moonpay-back-to-home"
                            rightButtonTestID="moonpay-add-amount"
                        />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    dailyLimits: getCustomerDailyLimits(state),
    monthlyLimits: getCustomerMonthlyLimits(state),
    amount: state.exchanges.moonpay.amount,
    denomination: state.exchanges.moonpay.denomination,
    exchangeRates: state.exchanges.moonpay.exchangeRates,
    defaultCurrencyCode: getDefaultCurrencyCode(state),
    mostRecentTransaction: getMostRecentTransaction(state),
});

export default withTranslation()(connect(mapStateToProps)(PurchaseLimitWarning));
