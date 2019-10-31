import toLower from 'lodash/toLower';
import includes from 'lodash/includes';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Linking, StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { getLatestAddressForMoonPaySelectedAccount } from 'shared-modules/selectors/accounts';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { getAmountInFiat, prepareMoonPayExternalLink } from 'shared-modules/exchanges/MoonPay/utils';
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
    };

    /**
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        navigator.pop(this.props.componentId);
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

        if (includes(IdentityConfirmationWarning.iotaDenominations, denomination)) {
            return amount
                ? Number((Number(amount) * exchangeRates[this.getActiveFiatCurrency(denomination)]).toFixed(2))
                : 0;
        }

        return amount ? Number(Number(amount).toFixed(2)) : 0;
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
         if (includes(IdentityConfirmationWarning.iotaDenominations, denomination)) {
             // Default to USD since we don't allow user to set a default currency.
             return 'USD';
         }

         return denomination;
     }

    render() {
        const {
            address,
            t,
            theme: { body },
            amount,
            denomination,
        } = this.props;
        const textColor = { color: body.color };
        console.log(prepareMoonPayExternalLink(
            address,
            this.getAmountInFiat(amount, denomination),
            toLower(this.getActiveFiatCurrency(denomination)),
        ))
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
                                {t('moonpay:confirmIdentityExplanation', { limitBracket: "€150" })}
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
                            onLeftButtonPress={() => this.goBack()}
                            onRightButtonPress={() => {
                                Linking.openURL(
                                    prepareMoonPayExternalLink(
                                        address,
                                        this.getAmountInFiat(amount, denomination),
                                        toLower(this.getActiveFiatCurrency(denomination)),
                                    ),
                                );
                            }}
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
});

export default withTranslation()(connect(mapStateToProps)(IdentityConfirmationWarning));
