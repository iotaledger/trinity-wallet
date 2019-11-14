import isNull from 'lodash/isNull';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text, KeyboardAvoidingView } from 'react-native';
import navigator from 'libs/navigation';
import { generateAlert } from 'shared-modules/actions/alerts';
import { updateCustomer, updateCustomerInfo } from 'shared-modules/actions/exchanges/MoonPay';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getAmountInFiat, convertFiatCurrency } from 'shared-modules/exchanges/MoonPay/utils';
import { getThemeFromState } from 'shared-modules/selectors/global';
import {
    hasCompletedBasicIdentityVerification,
    hasCompletedAdvancedIdentityVerification,
    isLimitIncreaseAllowed,
    getDefaultCurrencyCode,
    getCustomerDailyLimits,
    getCustomerMonthlyLimits,
    shouldRequireStateInput,
    hasStoredAnyPaymentCards,
} from 'shared-modules/selectors/exchanges/MoonPay';
import WithUserActivity from 'ui/components/UserActivity';
import CustomTextInput from 'ui/components/CustomTextInput';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import { isIPhoneX } from 'libs/device';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
        width,
        justifyContent: 'space-between',
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
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** MoonPay user advanced info component */
class UserAdvancedInfo extends React.Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isUpdatingCustomer: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorUpdatingCustomer: PropTypes.bool.isRequired,
        /** @ignore */
        address: PropTypes.string,
        /** @ignore */
        city: PropTypes.string,
        /** @ignore */
        country: PropTypes.string,
        /** @ignore */
        zipCode: PropTypes.string,
        /** @ignore */
        state: PropTypes.string,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        updateCustomer: PropTypes.func.isRequired,
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        amount: PropTypes.string.isRequired,
        /** @ignore */
        denomination: PropTypes.string.isRequired,
        /** @ignore */
        exchangeRates: PropTypes.object.isRequired,
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
        shouldRequireStateInput: PropTypes.bool.isRequired,
        /** @ignore */
        hasAnyPaymentCards: PropTypes.bool.isRequired,
        /** @ignore */
        updateCustomerInfo: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            address: isNull(props.address) ? '' : props.address,
            city: isNull(props.city) ? '' : props.city,
            zipCode: isNull(props.zipCode) ? '' : props.zipCode,
            state: isNull(props.state) ? '' : props.state,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isUpdatingCustomer && !nextProps.isUpdatingCustomer && !nextProps.hasErrorUpdatingCustomer) {
            this.redirect(nextProps);
        }
    }

    /**
     * Navigates to the relevant screen
     *
     * @method redirect
     */
    redirect(props) {
        const {
            amount,
            denomination,
            exchangeRates,
            defaultCurrencyCode,
            isPurchaseLimitIncreaseAllowed,
            hasCompletedBasicIdentityVerification,
            hasCompletedAdvancedIdentityVerification,
            dailyLimits,
            monthlyLimits,
        } = props;

        const fiatAmount = getAmountInFiat(Number(amount), denomination, exchangeRates);

        const purchaseAmount = convertFiatCurrency(
            fiatAmount,
            exchangeRates,
            denomination,
            // Convert to currency code set by user (not in the app) but what it is set on MoonPay servers
            defaultCurrencyCode,
        );
        this.redirectToScreen(
            hasCompletedBasicIdentityVerification &&
                !isPurchaseLimitIncreaseAllowed &&
                hasCompletedAdvancedIdentityVerification &&
                (purchaseAmount > dailyLimits.dailyLimitRemaining ||
                    purchaseAmount > monthlyLimits.monthlyLimitRemaining)
                ? 'purchaseLimitWarning'
                : 'addPaymentMethod',
        );
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
     * Updates customer information
     *
     * @method updateCustomer
     *
     * @returns {function}
     */
    updateCustomer() {
        const { hasAnyPaymentCards, shouldRequireStateInput, country, t } = this.props;

        if (!this.state.address) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidAddress'),
                t('moonpay:invalidAddressExplanation'),
            );
        }

        if (shouldRequireStateInput && !this.state.state) {
            return this.props.generateAlert('error', t('moonpay:invalidState'), t('moonpay:invalidStateExplanation'));
        }

        if (!this.state.city) {
            return this.props.generateAlert('error', t('moonpay:invalidCity'), t('moonpay:invalidCityExplanation'));
        }

        if (!this.state.zipCode) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidZipCode'),
                t('moonpay:invalidZipCodeExplanation'),
            );
        }

        const data = {
            address: {
                country,
                street: this.state.address,
                town: this.state.city,
                postCode: this.state.zipCode,
                ...(shouldRequireStateInput && { state: this.state.state }),
            },
        };

        if (hasAnyPaymentCards) {
            this.props.updateCustomerInfo(data);
            return this.redirect(this.props);
        }

        this.props.updateCustomer(data);
    }

    renderTextField(label, value, restProps) {
        const { theme } = this.props;

        return (
            <AnimatedComponent
                animationInType={['slideInRight', 'fadeIn']}
                animationOutType={['slideOutLeft', 'fadeOut']}
                delay={240}
            >
                <CustomTextInput
                    label={label}
                    theme={theme}
                    autoCorrect={false}
                    enablesReturnKeyAutomatically
                    returnKeyType="next"
                    value={value}
                    {...restProps}
                />
            </AnimatedComponent>
        );
    }

    renderTextFields() {
        const { shouldRequireStateInput, t } = this.props;

        if (shouldRequireStateInput) {
            return (
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 0.6 }} />
                    {this.renderTextField(t('moonpay:address'), this.state.address, {
                        onValidTextChange: (address) => this.setState({ address }),
                        onSubmitEditing: () => {
                            if (this.state.address) {
                                this.stateTextField.focus();
                            }
                        },
                    })}
                    <View style={{ flex: 0.6 }} />
                    {this.renderTextField(t('moonpay:state'), this.state.state, {
                        onValidTextChange: (state) => this.setState({ state }),
                        onRef: (c) => {
                            this.stateTextField = c;
                        },
                        onSubmitEditing: () => {
                            if (this.state.state) {
                                this.city.focus();
                            }
                        },
                    })}
                    <View style={{ flex: 0.6 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={160}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                width,
                                justifyContent: 'space-around',
                            }}
                        >
                            {this.renderTextField(t('moonpay:city'), this.state.city, {
                                onValidTextChange: (city) => this.setState({ city }),
                                containerStyle: {
                                    width: isIPhoneX ? width / 2.33 : width / 2.66,
                                },
                                onRef: (c) => {
                                    this.city = c;
                                },
                                onSubmitEditing: () => {
                                    if (this.state.city) {
                                        this.zipCode.focus();
                                    }
                                },
                            })}
                            {this.renderTextField(t('moonpay:zipCode'), this.state.zipCode, {
                                onValidTextChange: (zipCode) => this.setState({ zipCode }),
                                containerStyle: {
                                    width: isIPhoneX ? width / 2.33 : width / 2.66,
                                },
                                onRef: (c) => {
                                    this.zipCode = c;
                                },
                                returnKeyType: 'done',
                            })}
                        </View>
                    </AnimatedComponent>
                    <View style={{ flex: 0.6 }} />
                </View>
            );
        }

        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 0.6 }} />
                {this.renderTextField(t('moonpay:address'), this.state.address, {
                    onValidTextChange: (address) => this.setState({ address }),
                    onSubmitEditing: () => {
                        if (this.state.address) {
                            this.city.focus();
                        }
                    },
                })}
                <View style={{ flex: 0.6 }} />
                {this.renderTextField(t('moonpay:city'), this.state.city, {
                    onValidTextChange: (city) => this.setState({ city }),
                    onRef: (c) => {
                        this.city = c;
                    },
                    onSubmitEditing: () => {
                        if (this.state.city) {
                            this.zipCode.focus();
                        }
                    },
                })}
                <View style={{ flex: 0.6 }} />
                {this.renderTextField(t('moonpay:zipCode'), this.state.zipCode, {
                    onValidTextChange: (zipCode) => this.setState({ zipCode }),
                    onRef: (c) => {
                        this.zipCode = c;
                    },
                    returnKeyType: 'done',
                })}
                <View style={{ flex: 0.6 }} />
            </View>
        );
    }

    render() {
        const { t, theme, isUpdatingCustomer } = this.props;

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
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={320}
                        >
                            <InfoBox>
                                <Text style={[styles.infoText, { color: theme.body.color }]}>
                                    {t('moonpay:tellUsMore')}
                                </Text>
                                <Text
                                    style={[
                                        styles.infoTextRegular,
                                        { paddingTop: height / 60, color: theme.body.color },
                                    ]}
                                >
                                    {t('moonpay:cardBillingAddress')}
                                </Text>
                            </InfoBox>
                        </AnimatedComponent>
                        {this.renderTextFields()}
                    </View>
                    <View style={styles.bottomContainer}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                            <DualFooterButtons
                                onLeftButtonPress={() => this.goBack()}
                                onRightButtonPress={() => this.updateCustomer()}
                                isRightButtonLoading={isUpdatingCustomer}
                                disableLeftButton={isUpdatingCustomer}
                                leftButtonText={t('global:goBack')}
                                rightButtonText={t('global:continue')}
                                leftButtonTestID="moonpay-back"
                                rightButtonTestID="moonpay-add-payment-method"
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
    isUpdatingCustomer: state.exchanges.moonpay.isUpdatingCustomer,
    hasErrorUpdatingCustomer: state.exchanges.moonpay.hasErrorUpdatingCustomer,
    address: state.exchanges.moonpay.customer.address.street,
    city: state.exchanges.moonpay.customer.address.town,
    country: state.exchanges.moonpay.customer.address.country,
    zipCode: state.exchanges.moonpay.customer.address.postCode,
    state: state.exchanges.moonpay.customer.address.state,
    amount: state.exchanges.moonpay.amount,
    denomination: state.exchanges.moonpay.denomination,
    exchangeRates: state.exchanges.moonpay.exchangeRates,
    hasCompletedBasicIdentityVerification: hasCompletedBasicIdentityVerification(state),
    hasCompletedAdvancedIdentityVerification: hasCompletedAdvancedIdentityVerification(state),
    isPurchaseLimitIncreaseAllowed: isLimitIncreaseAllowed(state),
    dailyLimits: getCustomerDailyLimits(state),
    monthlyLimits: getCustomerMonthlyLimits(state),
    defaultCurrencyCode: getDefaultCurrencyCode(state),
    shouldRequireStateInput: shouldRequireStateInput(state),
    hasAnyPaymentCards: hasStoredAnyPaymentCards(state),
});

const mapDispatchToProps = {
    generateAlert,
    updateCustomer,
    updateCustomerInfo,
};

export default WithUserActivity()(
    withTranslation()(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(UserAdvancedInfo),
    ),
);
