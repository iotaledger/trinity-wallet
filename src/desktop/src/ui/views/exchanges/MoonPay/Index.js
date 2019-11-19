import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Icon from 'ui/components/Icon';

import AddAmount from 'ui/views/exchanges/MoonPay/AddAmount';
import IdentityConfirmationWarning from 'ui/views/exchanges/MoonPay/IdentityConfirmationWarning';
import AddPaymentMethod from 'ui/views/exchanges/MoonPay/AddPaymentMethod';
import SelectAccount from 'ui/views/exchanges/MoonPay/SelectAccount';
import Landing from 'ui/views/exchanges/MoonPay/Landing';
import SetupEmail from 'ui/views/exchanges/MoonPay/SetupEmail';
import SelectPaymentCard from 'ui/views/exchanges/MoonPay/SelectPaymentCard';
import PurchaseLimitWarning from 'ui/views/exchanges/MoonPay/PurchaseLimitWarning';
import VerifyEmail from 'ui/views/exchanges/MoonPay/VerifyEmail';
import UserBasicInfo from 'ui/views/exchanges/MoonPay/UserBasicInfo';
import UserAdvancedInfo from 'ui/views/exchanges/MoonPay/UserAdvancedInfo';
import ReviewPurchase from 'ui/views/exchanges/MoonPay/ReviewPurchase';
import PurchaseReceipt from 'ui/views/exchanges/MoonPay/PurchaseReceipt';
import PaymentSuccess from 'ui/views/exchanges/MoonPay/PaymentSuccess';
import PaymentFailure from 'ui/views/exchanges/MoonPay/PaymentFailure';
import PaymentPending from 'ui/views/exchanges/MoonPay/PaymentPending';

import css from './index.scss';

/**
 * MoonPay exchange functionallity router wrapper component
 */
class MoonPay extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        location: PropTypes.object,
    };

    render() {
        const { location } = this.props;
        const currentKey = location.pathname.split('/')[3] || '/';

        return (
            <main className={css.main}>
                <header>
                    <Icon icon="moonpay" size={200} />
                </header>
                <TransitionGroup>
                    <CSSTransition key={currentKey} classNames="slide" timeout={1000} mountOnEnter unmountOnExit>
                        <div>
                            <Switch location={location}>
                                <Route path="/exchanges/moonpay/add-amount" component={AddAmount} />
                                <Route path="/exchanges/moonpay/select-payment-card" component={SelectPaymentCard} />
                                <Route path="/exchanges/moonpay/select-account" component={SelectAccount} />
                                <Route path="/exchanges/moonpay/setup-email" component={SetupEmail} />
                                <Route path="/exchanges/moonpay/verify-email" component={VerifyEmail} />
                                <Route path="/exchanges/moonpay/user-basic-info" component={UserBasicInfo} />
                                <Route path="/exchanges/moonpay/user-advanced-info" component={UserAdvancedInfo} />
                                <Route path="/exchanges/moonpay/add-payment-method" component={AddPaymentMethod} />
                                <Route path="/exchanges/moonpay/review-purchase" component={ReviewPurchase} />
                                <Route path="/exchanges/moonpay/purchase-receipt" component={PurchaseReceipt} />
                                <Route path="/exchanges/moonpay/payment-success" component={PaymentSuccess} />
                                <Route path="/exchanges/moonpay/payment-failure" component={PaymentFailure} />
                                <Route path="/exchanges/moonpay/payment-pending" component={PaymentPending} />

                                <Route
                                    path="/exchanges/moonpay/purchase-limit-warning"
                                    component={PurchaseLimitWarning}
                                />
                                <Route
                                    path="/exchanges/moonpay/identity-confirmation-warning"
                                    component={IdentityConfirmationWarning}
                                />

                                <Route path="/" component={Landing} />
                            </Switch>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </main>
        );
    }
}

export default withRouter(withTranslation()(MoonPay));
