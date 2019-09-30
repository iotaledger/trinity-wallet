import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AmountTextInput from 'ui/components/AmountTextInput';
import { getCurrencySymbol, getIOTAUnitMultiplier } from 'shared-modules/libs/currency';
import navigator from 'libs/navigation';
import InfoBox from 'ui/components/InfoBox';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import AnimatedComponent from 'ui/components/AnimatedComponent';

const styles = StyleSheet.create({
    animation: {
        width: width / 2.4,
        height: width / 2.4,
        alignSelf: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3.3,
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
    greetingTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 1.5,
    },
    greetingText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** MoonPay add amount screen component */
class AddAmount extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            currencySymbol: getCurrencySymbol(this.props.currency),
        };
    }

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    static redirectToScreen(screen) {
        navigator.push(screen);
    }

    /**
     *   Gets multiplier used in converting IOTA denominations (Ti, Gi, Mi, Ki, i) and fiat to basic IOTA unit (i)
     *   @method getUnitMultiplier
     *   @returns {number}
     **/
    getUnitMultiplier() {
        const { usdPrice, conversionRate, denomination } = this.props;
        const { currencySymbol } = this.state;
        if (denomination === currencySymbol) {
            return 1000000 / usdPrice / conversionRate;
        }
    }

    render() {
        const { t, theme, themeName } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                <View style={styles.topContainer}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={400}
                    >
                        <Header textColor={theme.body.color} />
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
                        <AmountTextInput
                            label={t('moonpay:enterAmount')}
                            amount=""
                            denomination="i"
                            multiplier={this.getUnitMultiplier()}
                            setAmount={(text) => {}}
                            setDenomination={(text) => {}}
                            onRef={(c) => {
                                this.amountField = c;
                            }}
                        />
                    </AnimatedComponent>
                    <View style={{ flex: 0.3 }} />
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: width / 1.2,
                        }}
                    >
                        <Text style={[styles.infoTextLight, textColor]}>You will receive</Text>
                        <Text style={[styles.infoTextLight, textColor]}>82.12 Miota</Text>
                    </View>
                    <View style={{ flex: 0.05 }} />
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: width / 1.2,
                        }}
                    >
                        <Text style={[styles.infoTextLight, textColor]}>Market Price: 82.13 Mi @ $0.12</Text>
                        <Text style={[styles.infoTextLight, textColor]}>$0.12</Text>
                    </View>
                    <View style={{ flex: 0.05 }} />
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: width / 1.2,
                        }}
                    >
                        <Text style={[styles.infoTextLight, textColor]}>MoonPay Fee</Text>
                        <Text style={[styles.infoTextLight, textColor]}>$4.99</Text>
                    </View>
                    <View style={{ flex: 0.3 }} />
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: width / 1.2,
                        }}
                    >
                        <Text style={[styles.infoTextRegular, textColor]}>Total</Text>
                        <Text style={[styles.infoTextBold, textColor]}>$42.00</Text>
                    </View>
                    <View style={{ flex: 0.3 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']}>
                        <DualFooterButtons
                            onLeftButtonPress={() => AddAmount.redirectToScreen('landing')}
                            onRightButtonPress={() => AddAmount.redirectToScreen('selectAccount')}
                            leftButtonText={t('global:goBack')}
                            rightButtonText={t('global:purchase')}
                            leftButtonTestID="walletSetup-no"
                            rightButtonTestID="walletSetup-yes"
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
});

export default withTranslation()(connect(mapStateToProps)(AddAmount));
