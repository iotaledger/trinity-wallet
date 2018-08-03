import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import Sidebar from 'ui/views/wallet/Sidebar';
import Dashboard from 'ui/views/wallet/Dashboard';
import Polling from 'ui/global/Polling';

import css from './index.scss';

/**
 * Wallet functionallity router wrapper component
 */
class Wallet extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        location: PropTypes.object,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
    };

    render() {
        const { location, history } = this.props;

        return (
            <main className={css.wallet}>
                <Polling />
                <Sidebar history={history} location={location} />
                <Dashboard location={location} history={history} />
            </main>
        );
    }
}

export default withRouter(Wallet);
