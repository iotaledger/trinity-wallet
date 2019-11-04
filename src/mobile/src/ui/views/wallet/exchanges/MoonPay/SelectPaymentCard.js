import head from 'lodash/head';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import navigator from 'libs/navigation';
import { selectPaymentCard } from 'shared-modules/actions/exchanges/MoonPay';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { getCustomerPaymentCards, getSelectedPaymentCard } from 'shared-modules/selectors/exchanges/MoonPay';
import WithUserActivity from 'ui/components/UserActivity';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width, height } from 'libs/dimensions';
import Icon from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import DropdownComponent from 'ui/components/Dropdown';
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
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    linkWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: isIPhoneX ? width / 1.3 : width / 1.5,
    },
});

/** MoonPay select payment card component */
class SelectPaymentCard extends React.Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        selectedPaymentCard: PropTypes.object,
        /** @ignore */
        paymentCards: PropTypes.array.isRequired,
        /** @ignore */
        selectPaymentCard: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedPaymentCard: isEmpty(props.selectedPaymentCard)
                ? head(props.paymentCards)
                : props.selectedPaymentCard,
        };
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
     * Formats card info for dropdown options
     *
     * @method formatCardInfo
     *
     * @param {object} cardInfo
     *
     * @returns {object}
     */
    formatCardInfo(cardInfo) {
        const { brand, id, lastDigits } = cardInfo;

        return {
            id,
            text: `${brand} **** **** **** ${lastDigits}`,
        };
    }

    render() {
        const { t, theme } = this.props;

        const selectedPaymentCard = this.formatCardInfo(this.state.selectedPaymentCard);
        const paymentCards = map(this.props.paymentCards, this.formatCardInfo);

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
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
                                    Select Payment Method
                                </Text>
                                <Text
                                    style={[
                                        styles.infoTextRegular,
                                        { paddingTop: height / 60, color: theme.body.color },
                                    ]}
                                >
                                    Please select your payment method
                                </Text>
                            </InfoBox>
                        </AnimatedComponent>
                        <View style={{ flex: 0.6 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={240}
                        >
                            <DropdownComponent
                                title="Payment Method"
                                onRef={(c) => {
                                    this.dropdown = c;
                                }}
                                value={selectedPaymentCard.text}
                                options={map(paymentCards, (card) => card.text)}
                                saveSelection={(paymentCardText) => {
                                    const paymentCard = find(paymentCards, { text: paymentCardText });

                                    this.setState({
                                        selectedPaymentCard: find(this.props.paymentCards, { id: paymentCard.id }),
                                    });
                                }}
                            />
                        </AnimatedComponent>
                        <View style={{ flex: 0.1 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={240}
                        >
                            <TouchableOpacity
                                style={styles.linkWrapper}
                                onPress={() => this.redirectToScreen('addPaymentMethod')}
                            >
                                <Text
                                    style={[
                                        styles.infoTextRegular,
                                        {
                                            paddingTop: height / 60,
                                            color: theme.body.color,
                                        },
                                    ]}
                                >
                                    <Icon
                                        iconStyle={{
                                            marginTop: height / 90,
                                        }}
                                        name="plusAlt"
                                        size={width / 32}
                                        color={theme.body.color}
                                    />
                                    {'  '}
                                    Add a payment method
                                </Text>
                            </TouchableOpacity>
                        </AnimatedComponent>
                        <View style={{ flex: 0.6 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                            <DualFooterButtons
                                onLeftButtonPress={() => this.goBack()}
                                onRightButtonPress={() => {
                                    this.props.selectPaymentCard(this.state.selectedPaymentCard.id);

                                    this.redirectToScreen('reviewPurchase');
                                }}
                                leftButtonText={t('global:goBack')}
                                rightButtonText={t('global:continue')}
                                leftButtonTestID="moonpay-back-to-home"
                                rightButtonTestID="moonpay-add-amount"
                            />
                        </AnimatedComponent>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    isUpdatingCustomer: state.exchanges.moonpay.isUpdatingCustomer,
    hasErrorUpdatingCustomer: state.exchanges.moonpay.hasErrorUpdatingCustomer,
    selectedPaymentCard: getSelectedPaymentCard(state),
    paymentCards: getCustomerPaymentCards(state),
});

const mapDispatchToProps = {
    selectPaymentCard,
};

export default WithUserActivity()(
    withTranslation()(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(SelectPaymentCard),
    ),
);
