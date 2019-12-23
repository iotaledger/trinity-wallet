import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Linking, StyleSheet, View } from 'react-native';
import withPurchaseSummary from 'ui/views/wallet/exchanges/MoonPay/WithPurchaseSummary';
import { MOONPAY_TRANSACTION_STATUSES } from 'shared-modules/exchanges/MoonPay';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import navigator from 'libs/navigation';
import { width } from 'libs/dimensions';
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
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
});

/** MoonPay review purchase screen component */
class ReviewPurchase extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        renderChildren: PropTypes.func.isRequired,
        /** @ignore */
        isCreatingTransaction: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorCreatingTransaction: PropTypes.bool.isRequired,
        /** @ignore */
        createTransaction: PropTypes.func.isRequired,
        /** @ignore */
        activeTransaction: PropTypes.object,
    };

    componentWillReceiveProps(nextProps) {
        const _getNextScreenName = (transactionStatus) => {
            const screenNameMap = {
                [MOONPAY_TRANSACTION_STATUSES.completed]: 'Success',
                [MOONPAY_TRANSACTION_STATUSES.failed]: 'Failure',
                [MOONPAY_TRANSACTION_STATUSES.pending]: 'Pending',
            };

            return `payment${screenNameMap[transactionStatus]}`;
        };

        if (
            this.props.isCreatingTransaction &&
            !nextProps.isCreatingTransaction &&
            !nextProps.hasErrorCreatingTransaction
        ) {
            const { activeTransaction } = nextProps;

            // See https://www.moonpay.io/api_reference/v3#three_d_secure
            if (get(activeTransaction, 'status') === MOONPAY_TRANSACTION_STATUSES.waitingAuthorization) {
                Linking.openURL(get(activeTransaction, 'redirectUrl'));
                this.redirectToScreen(_getNextScreenName(MOONPAY_TRANSACTION_STATUSES.pending));
            } else {
                this.redirectToScreen(_getNextScreenName(get(activeTransaction, 'status')));
            }
        }
    }

    /**
     * Returns config for HOC
     *
     * @method getConfig
     */
    getConfig() {
        return {
            header: 'moonpay:reviewYourPurchase',
            subtitle: 'moonpay:pleaseCarefullyCheckOrder',
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
     * Pops to addAmount in the navigation stack
     * @method goBack
     */
    goBack() {
        navigator.popTo('addAmount');
    }

    render() {
        const { isCreatingTransaction, t, theme } = this.props;

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
                        <DualFooterButtons
                            onLeftButtonPress={() => this.goBack()}
                            onRightButtonPress={() => this.props.createTransaction()}
                            isRightButtonLoading={isCreatingTransaction}
                            disableLeftButton={isCreatingTransaction}
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

export default withPurchaseSummary(ReviewPurchase);
