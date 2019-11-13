import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import AddAmount from 'ui/views/exchanges/MoonPay/AddAmount';
import AddPaymentMethod from 'ui/views/exchanges/MoonPay/AddPaymentMethod';
import SelectAccount from 'ui/views/exchanges/MoonPay/SelectAccount';
import Landing from 'ui/views/exchanges/MoonPay/Landing';
import SetupEmail from 'ui/views/exchanges/MoonPay/SetupEmail';
import SelectPaymentCard from 'ui/views/exchanges/MoonPay/SelectPaymentCard';
import VerifyEmail from 'ui/views/exchanges/MoonPay/VerifyEmail';
import UserBasicInfo from 'ui/views/exchanges/MoonPay/UserBasicInfo';
import UserAdvancedInfo from 'ui/views/exchanges/MoonPay/UserAdvancedInfo';
import ReviewPurchase from 'ui/views/exchanges/MoonPay/ReviewPurchase';

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
        const currentKey = location.pathname.split('/')[2] || '/';

        return (
            <main className={css.main}>
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
