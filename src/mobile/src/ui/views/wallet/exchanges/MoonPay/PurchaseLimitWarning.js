import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import navigator from 'libs/navigation';
import DualFooterButtons from 'ui/components/DualFooterButtons';
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
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Regular',
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
    };

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    static redirectToScreen(screen) {
        navigator.push(screen);
    }

    render() {
        const {
            t,
            theme: { body },
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
                    <View style={{ flex: 0.2 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={266}
                    >
                        <InfoBox>
                            <Text style={[styles.infoText, textColor]}>Limit Exceeded :(</Text>
                            <Text style={[styles.infoTextRegular, textColor, { paddingTop: height / 60 }]}>
                                Unfortunately you have exceeded your Moonpay daily/monthly purchase limit. You may only
                                purchase X$ of IOTA per day/month.
                            </Text>
                            <Text style={[styles.infoTextRegular, textColor, { paddingTop: height / 60 }]}>
                                Your limit will reset at 00:00 on DD/MM/YY
                            </Text>
                        </InfoBox>
                    </AnimatedComponent>
                    <View style={{ flex: 0.3 }} />
                    <AnimatedComponent
                        animationInType={['fadeIn', 'slideInRight']}
                        animationOutType={['fadeOut', 'slideOutLeft']}
                        delay={133}
                    >
                        <Text style={[styles.infoTextRegular, textColor, { textDecorationLine: 'underline' }]}>
                            {t('moonpay:termsAndConditionsApply')}
                        </Text>
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']}>
                        <DualFooterButtons
                            onLeftButtonPress={() => navigator.popTo('home')}
                            onRightButtonPress={() => PurchaseLimitWarning.redirectToScreen('addAmount')}
                            leftButtonText={t('global:goBack')}
                            rightButtonText={t('global:continue')}
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
});

export default withTranslation()(connect(mapStateToProps)(PurchaseLimitWarning));
