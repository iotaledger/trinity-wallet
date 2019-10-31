import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import withPurchaseSummary from 'ui/views/wallet/exchanges/MoonPay/WithPurchaseSummary';
import SingleFooterButton from 'ui/components/SingleFooterButton';
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

/** MoonPay purchase complete screen component */
class PurchaseComplete extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        children: PropTypes.node.isRequired,
    };

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    redirectToHome() {
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
                {this.props.children}
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']}>
                        <SingleFooterButton
                            onButtonPress={() => this.redirectToHome()}
                            buttonText={t('global:done')}
                        />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const config = {
    header: 'moonpay:purchaseComplete',
    subtitle: 'moonpay:transactionMayTakeAFewMinutes',
};

export default withPurchaseSummary(PurchaseComplete, config);
