import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import Sidebar from 'ui/views/wallet/Sidebar';
import Dashboard from 'ui/views/wallet/Dashboard';

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

        return (
            <main className={css.wallet}>
                <Sidebar history={history} location={location} />
                <section className={location.pathname === '/wallet/charts' ? css.slided : null}>
                    <Dashboard location={location} history={history} />
                </section>
            </main>
        );
    }
}

export default withRouter(Wallet);
