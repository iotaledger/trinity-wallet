import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { getActiveTransaction } from 'shared-modules/selectors/exchanges/MoonPay';
import { getPurchaseFailureReason } from 'shared-modules/exchanges/MoonPay/utils';
import navigator from 'libs/navigation';
import InfoBox from 'ui/components/InfoBox';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import SingleFooterButton from 'ui/components/SingleFooterButton';

const styles = StyleSheet.create({
    animation: {
        width: width / 1.35,
        height: width / 1.35,
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
        textAlign: 'center',
    },
});

/** MoonPay payment failure screen component */
class PaymentFailure extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Transaction failure reason */
        failureReason: PropTypes.object.isRequired
    };

    /**
     * Navigates to dashboard
     * @method goBack
     */
    goToDashboard() {
        navigator.setStackRoot('home');
    }

    render() {
        const {
            t,
            theme: { body, negative },
            failureReason
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
                        <Header iconSize={width / 3} iconName='moonpay' textColor={body.color} />
                    </AnimatedComponent>
                </View>
                <View style={styles.midContainer}>
                    <View style={{ flex: 1 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={266}
                    >
                        <InfoBox containerStyle={{ backgroundColor: negative.color }}>
                            <Text style={[styles.infoText, textColor]}>{t('moonpay:paymentFailure')}</Text>
                            <Text style={[styles.infoTextRegular, textColor, { paddingTop: height / 60 }]}>
                                {t('moonpay:paymentFailureExplanation')}
                            </Text>
                            { failureReason && <Text style={[styles.infoTextRegular, textColor, { paddingTop: height / 60 }]}>
                                {getPurchaseFailureReason(failureReason, t)}
                            </Text>
                            }
                        </InfoBox>
                    </AnimatedComponent>
                    <View style={{ flex: 1.5 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']}>
                        <SingleFooterButton onButtonPress={() => this.goToDashboard()} buttonText={t('global:goToDashboard')} />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    themeName: state.settings.themeName,
    failureReason: get(getActiveTransaction(state), 'failureReason'),
});

export default withTranslation()(connect(mapStateToProps)(PaymentFailure));
