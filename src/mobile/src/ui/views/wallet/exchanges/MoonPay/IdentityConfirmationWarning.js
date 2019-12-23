import cloneDeep from 'lodash/cloneDeep';
import difference from 'lodash/difference';
import head from 'lodash/head';
import map from 'lodash/map';
import toLower from 'lodash/toLower';
import size from 'lodash/size';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Linking, StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { fetchMeta, setTransactionActive } from 'shared-modules/actions/exchanges/MoonPay';
import { getLatestAddressForMoonPaySelectedAccount } from 'shared-modules/selectors/accounts';
import {
    getCustomerEmail,
    getDefaultCurrencyCode,
    getCustomerDailyLimits,
    getCustomerMonthlyLimits,
    hasCompletedAdvancedIdentityVerification,
    isLimitIncreaseAllowed,
    getAllTransactions,
} from 'shared-modules/selectors/exchanges/MoonPay';
import { getThemeFromState } from 'shared-modules/selectors/global';
import {
    prepareMoonPayExternalLink,
    getAmountInFiat,
    getActiveFiatCurrency,
    convertFiatCurrency,
} from 'shared-modules/exchanges/MoonPay/utils';
import navigator from 'libs/navigation';
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

/** MoonPay identity confirmation warning screen component */
class IdentityConfirmationWarning extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        amount: PropTypes.string.isRequired,
        /** @ignore */
        denomination: PropTypes.string.isRequired,
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        address: PropTypes.string.isRequired,
        /** @ignore */
        exchangeRates: PropTypes.object.isRequired,
        /** @ignore */
        isPurchaseLimitIncreaseAllowed: PropTypes.bool.isRequired,
        /** @ignore */
        hasCompletedAdvancedIdentityVerification: PropTypes.bool.isRequired,
        /** @ignore */
        dailyLimits: PropTypes.object.isRequired,
        /** @ignore */
        monthlyLimits: PropTypes.object.isRequired,
        /** @ignore */
        defaultCurrencyCode: PropTypes.string.isRequired,
        /** @ignore */
        moonpayPurchases: PropTypes.array.isRequired,
        /** @ignore */
        isFetchingMoonPayMeta: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorFetchingMoonPayMeta: PropTypes.bool.isRequired,
        /** @ignore */
        fetchMeta: PropTypes.func.isRequired,
        /** @ignore */
        setTransactionActive: PropTypes.func.isRequired,
        /** @ignore */
        email: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            moonpayPurchases: cloneDeep(props.moonpayPurchases),
        };
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.isFetchingMoonPayMeta &&
            !nextProps.isFetchingMoonPayMeta &&
            !nextProps.hasErrorFetchingMoonPayMeta
        ) {
            const {
                address,
                amount,
                denomination,
                dailyLimits,
                monthlyLimits,
                isPurchaseLimitIncreaseAllowed,
                hasCompletedAdvancedIdentityVerification,
                defaultCurrencyCode,
                email,
                exchangeRates,
                moonpayPurchases,
            } = nextProps;

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
                Linking.openURL(
                    prepareMoonPayExternalLink(
                        email,
                        address,
                        getAmountInFiat(Number(amount), denomination, exchangeRates),
                        toLower(getActiveFiatCurrency(denomination)),
                    ),
                );
            } else {
                if (size(moonpayPurchases) > size(this.state.moonpayPurchases)) {
                    const oldTransactionIds = map(this.state.moonpayPurchases, (purchase) => purchase.id);
                    const newTransactionIds = map(moonpayPurchases, (purchase) => purchase.id);

                    const diff = difference(oldTransactionIds, newTransactionIds);
                    const newTransactionId = head(diff);

                    this.props.setTransactionActive(newTransactionId);
                    this.redirectToScreen('paymentPending');
                } else {
                    this.redirectToScreen('reviewPurchase');
                }
            }
        }
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

    render() {
        const {
            t,
            theme: { body },
            isFetchingMoonPayMeta,
        } = this.props;
        const textColor = { color: body.color };

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
                            <Text style={[styles.infoText, textColor]}>{t('moonpay:confirmIdentity')}</Text>
                            <Text style={[styles.infoTextRegular, textColor, { paddingTop: height / 30 }]}>
                                {t('moonpay:confirmIdentityExplanation', { amount: '€150' })}
                            </Text>
                            <Text style={[styles.infoTextRegular, textColor, { paddingTop: height / 30 }]}>
                                {t('moonpay:moonpayRedirect')}
                            </Text>
                        </InfoBox>
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']}>
                        <DualFooterButtons
                            isRightButtonLoading={isFetchingMoonPayMeta}
                            disableLeftButton={isFetchingMoonPayMeta}
                            onLeftButtonPress={() => this.goBack()}
                            onRightButtonPress={() => this.props.fetchMeta()}
                            leftButtonText={t('global:goBack')}
                            rightButtonText={t('global:okay')}
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
    amount: state.exchanges.moonpay.amount,
    denomination: state.exchanges.moonpay.denomination,
    exchangeRates: state.exchanges.moonpay.exchangeRates,
    address: getLatestAddressForMoonPaySelectedAccount(state),
    email: getCustomerEmail(state),
    isPurchaseLimitIncreaseAllowed: isLimitIncreaseAllowed(state),
    hasCompletedAdvancedIdentityVerification: hasCompletedAdvancedIdentityVerification(state),
    dailyLimits: getCustomerDailyLimits(state),
    monthlyLimits: getCustomerMonthlyLimits(state),
    moonpayPurchases: getAllTransactions(state),
    defaultCurrencyCode: getDefaultCurrencyCode(state),
    isFetchingMoonPayMeta: state.exchanges.moonpay.isFetchingMoonPayMeta,
    hasErrorFetchingMoonPayMeta: state.exchanges.moonpay.hasErrorFetchingMoonPayMeta,
});

const mapDispatchToProps = {
    fetchMeta,
    setTransactionActive,
};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(IdentityConfirmationWarning));
