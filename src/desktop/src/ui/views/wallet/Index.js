import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Switch, Route, withRouter } from 'react-router-dom';

import Sidebar from 'ui/views/wallet/Sidebar';
import Balance from 'ui/views/wallet/Balance';
import Receive from 'ui/views/wallet/Receive';
import Send from 'ui/views/wallet/Send';

import Slideout from 'ui/components/Slideout';

import css from 'ui/index.css';

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

        return (
            <div className={classNames(css.main, location.pathname === '/wallet/send' ? css.slided : null)}>
                <div className={css.columns}>
                    <Sidebar history={history} />
                    <section>
                        <Balance history={history} />
                    </section>
                </div>
                <Slideout
                    active={location.pathname === '/wallet/send'}
                    onClose={() => {
                        history.push('/wallet/');
                    }}
                >
                    <Switch location={location}>
                        <Route path="/wallet/send" component={Send} />
                        <Route path="/wallet/receive" component={Receive} />
                    </Switch>
                </Slideout>
            </div>
        );
    }
}

export default withRouter(Wallet);
