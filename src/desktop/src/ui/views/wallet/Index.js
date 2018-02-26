import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Switch, Route, withRouter } from 'react-router-dom';

import Sidebar from 'ui/views/wallet/Sidebar';
import Dashboard from 'ui/views/wallet/Dashboard';
import Receive from 'ui/views/wallet/Receive';
import Send from 'ui/views/wallet/Send';

import Slideout from 'ui/components/Slideout';
import Balance from 'ui/components/Balance';
import Icon from 'ui/components/Icon';

import css from './index.css';

/**
 * Wallet functionallity router wrapper component
 */
class Wallet extends React.PureComponent {
    static propTypes = {
        /* Browser location objects */
        location: PropTypes.object,
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
    };

    render() {
        const { location, history } = this.props;

        const hasSlideout = location.pathname === '/wallet/send' || location.pathname === '/wallet/receive';

        return (
            <main className={classNames(css.wallet, hasSlideout ? css.slided : null)}>
                <Sidebar history={history} />
                <section>
                    <Dashboard history={history} />
                </section>
                <Slideout
                    active={hasSlideout}
                    onClose={() => {
                        history.push('/wallet/');
                    }}
                >
                    <header>
                        <div>
                            <Balance />
                            <a onClick={() => history.push('/wallet/')}>
                                <Icon icon="cross" size={40} />
                            </a>
                        </div>
                    </header>
                    <Switch location={location}>
                        <Route path="/wallet/send" component={Send} />
                        <Route path="/wallet/receive" component={Receive} />
                    </Switch>
                </Slideout>
            </main>
        );
    }
}

export default withRouter(Wallet);
