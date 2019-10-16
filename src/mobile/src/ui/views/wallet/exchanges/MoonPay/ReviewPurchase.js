import includes from 'lodash/includes';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { getLatestAddressForMoonPaySelectedAccount } from 'shared-modules/selectors/accounts';
import { getMoonPayFee, getTotalPurchaseAmount } from 'shared-modules/selectors/exchanges/MoonPay';
import { fetchQuote, setAmount, createTransaction } from 'shared-modules/actions/exchanges/MoonPay';
import DualFooterButtons from 'ui/components/DualFooterButtons';
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

/** MoonPay review purchsase screen component */
class ReviewPurchase extends Component {
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
        createTransaction: PropTypes.func.isRequired,
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

        if (includes(ReviewPurchase.iotaDenominations, denomination)) {
            return amount ? Number((Number(amount) * exchangeRates.USD).toFixed(2)) : 0;
        }

        return amount ? Number(Number(amount).toFixed(2)) : 0;
    }

    getAmountinMiota() {
        const { amount, exchangeRates } = this.props;

        if (!amount) {
            return '0 Mi';
        }

        return `${(Number(amount) / exchangeRates.USD).toFixed(2)} Mi`;
    }

    getReceiveAmount() {
        const { amount, denomination, exchangeRates } = this.props;

        if (includes(ReviewPurchase.iotaDenominations, denomination)) {
            return amount ? `${amount} Mi` : '0 Mi';
        }

        return amount ? `${(Number(amount) / exchangeRates.USD).toFixed(2)} Mi` : '0 Mi';
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
        return amount ? `$${amount.toFixed(2)}` : '$0';
    }

    createTransaction() {
        const { amount, denomination, address } = this.props;

        this.props.createTransaction(this.getAmountInFiat(amount, denomination), 'usd', address);
    }

    render() {
        const {
            isCreatingTransaction,
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
        } = this.props;

        const textColor = { color: theme.body.color };

        const receiveAmount = this.getReceiveAmount();

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
                        delay={266}
                    >
                        <InfoBox>
                            <Text style={[styles.infoText, textColor]}>{t('moonpay:reviewYourPurchase')}</Text>
                            <Text
                                style={[
                                    styles.infoTextRegular,
                                    textColor,
                                    { paddingTop: height / 60, textAlign: 'center' },
                                ]}
                            >
                                {t('moonpay:pleaseCarefullyCheckOrder')}
                            </Text>
                        </InfoBox>
                    </AnimatedComponent>
                    <View style={{ flex: 0.3 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={200}
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
                        delay={200}
                    >
                        <View style={styles.summaryRowContainer}>
                            <Text style={[styles.infoTextRegular, textColor]}>{t('moonpay:trinityWalletAddress')}</Text>
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
                        delay={200}
                    >
                        <View style={styles.summaryRowContainer}>
                            <Text style={[styles.infoTextLight, textColor]}>{t('moonpay:debitCard', { brand })}</Text>
                            <Text style={[styles.infoTextLight, textColor]}>**** **** **** {lastDigits}</Text>
                        </View>
                    </AnimatedComponent>
                    <View style={{ flex: 0.05 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={200}
                    >
                        <View style={styles.summaryRowContainer}>
                            <Text style={[styles.infoTextLight, textColor]}>
                                {t('moonpay:cardExpiry', { brand: 'Visa' })}
                            </Text>
                            <Text style={[styles.infoTextLight, textColor]}>12/20</Text>
                        </View>
                    </AnimatedComponent>
                    <View style={{ flex: 0.4 }} />
                    <View style={styles.summaryRowContainer}>
                        <Text style={[styles.infoTextLight, textColor]}>You will receive</Text>
                        <Text style={[styles.infoTextLight, textColor]}>{receiveAmount}</Text>
                    </View>
                    <View style={{ flex: 0.05 }} />
                    <View style={styles.summaryRowContainer}>
                        <Text style={[styles.infoTextLight, textColor]}>
                            {t('moonpay:marketPrice')}: {receiveAmount} @ ${exchangeRates.USD}
                        </Text>
                        <Text style={[styles.infoTextLight, textColor]}>
                            {this.getStringifiedFiatAmount(this.getAmountInFiat(amount, denomination))}
                        </Text>
                    </View>
                    <View style={{ flex: 0.05 }} />
                    <View style={styles.summaryRowContainer}>
                        <Text style={[styles.infoTextLight, textColor]}>{t('moonpay:moonpayFee')}</Text>
                        <Text style={[styles.infoTextLight, textColor]}>${fee}</Text>
                    </View>
                    <View style={{ flex: 0.4 }} />
                    <View style={styles.summaryRowContainer}>
                        <Text style={[styles.infoTextRegular, textColor, { fontSize: Styling.fontSize5 }]}>
                            {t('global:total')}
                        </Text>
                        <Text style={[styles.infoTextBold, textColor, { fontSize: Styling.fontSize5 }]}>
                            ${totalAmount}
                        </Text>
                    </View>
                    <View style={{ flex: 0.3 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']}>
                        <DualFooterButtons
                            onLeftButtonPress={() => ReviewPurchase.redirectToScreen('landing')}
                            onRightButtonPress={() => this.createTransaction()}
                            isRightButtonLoading={isCreatingTransaction}
                            leftButtonText={t('global:goBack')}
                            rightButtonText={t('global:confirm')}
                            leftButtonTestID="moonpay-back"
                            rightButtonTestID="moonpay-done"
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
    exchangeRates: state.exchanges.moonpay.exchangeRates,
    fee: getMoonPayFee(state),
    totalAmount: getTotalPurchaseAmount(state),
    address: getLatestAddressForMoonPaySelectedAccount(state),
    brand: state.exchanges.moonpay.paymentCardInfo.brand,
    lastDigits: state.exchanges.moonpay.paymentCardInfo.lastDigits,
    isCreatingTransaction: state.exchanges.moonpay.isCreatingTransaction,
});

const mapDispatchToProps = {
    fetchQuote,
    setAmount,
    createTransaction,
};

export default withTranslation()(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(ReviewPurchase),
);
