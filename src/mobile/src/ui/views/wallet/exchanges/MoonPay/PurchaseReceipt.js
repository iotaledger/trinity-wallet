import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import withPurchaseSummary from 'ui/views/wallet/exchanges/MoonPay/WithPurchaseSummary';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import timer from 'react-native-timer';
import navigator from 'libs/navigation';
import { width } from 'libs/dimensions';
import Header from 'ui/components/Header';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { MOONPAY_TRANSACTION_STATUSES } from 'shared-modules/exchanges/MoonPay';

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
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
});

/** MoonPay purchase complete screen component */
class PurchaseComplete extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        renderChildren: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        activeTransaction: PropTypes.object,
    };

    /**
     * Returns config for HOC
     *
     * @method getConfig
     */
    getConfig() {
        return {
            header: 'moonpay:purchaseReceipt',
            subtitle: get(this.props.activeTransaction, 'status') === MOONPAY_TRANSACTION_STATUSES.completed ? 'moonpay:transactionMayTakeAFewMinutes' : 'moonpay:purchaseMayTakeAFewMinutes'
        };
    }

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    redirectToHome() {
        const { t , activeTransaction} = this.props;

        const transactionStatus = get(activeTransaction, 'status');
        timer.setTimeout(
            'delayAlert',
            () => {
                if (transactionStatus === MOONPAY_TRANSACTION_STATUSES.completed) {
                    this.props.generateAlert(
                        'success',
                        t('moonpay:purchaseComplete'),
                        t('moonpay:transactionMayTakeAFewMinutes'),
                        12000,
                    );
                } else if (transactionStatus === MOONPAY_TRANSACTION_STATUSES.pending) {
                    this.props.generateAlert(
                        'info',
                        t('moonpay:paymentPending'),
                        t('moonpay:purchaseMayTakeAFewMinutes'),
                        12000,
                    );
                }
            },
            2000,
        );
        navigator.setStackRoot('home');
    }

    render() {
        const { t, theme } = this.props;

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
                {this.props.renderChildren(this.getConfig())}
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']}>
                        <SingleFooterButton onButtonPress={() => this.redirectToHome()} buttonText={t('global:done')} />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

export default withPurchaseSummary(PurchaseComplete);
