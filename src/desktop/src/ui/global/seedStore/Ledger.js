import React from 'react';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';

import css from './index.scss';

/**
 * Ledger UI helpers
 */
class Ledger extends React.PureComponent {
    static timeout = null;

    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired
    };

    state = {
        connection: false,
        application: false
    };

    componentDidMount() {
        this.messageEvent = this.onMessage.bind(this);
        Electron.onEvent('ledger', this.messageEvent);
    }

    componentWillUnmount() {
        Electron.removeEvent('ledger', this.messageEvent);
    }

    onMessage(message) {
        if (typeof message.awaitConnection === 'boolean') {
            this.setState({
                connection: message.awaitConnection,
                application: false
            });
        }
        if (typeof message.awaitApplication === 'boolean') {
            this.setState({
                connection: false,
                application: message.awaitApplication
            });
        }
    }

    render() {
        const { t } = this.props;

        const on = this.state.connection || this.state.application;
        const message = this.state.connection ? 'connection' : 'application';

        return (
            <div className={classNames(css.modal, on ? css.on : null)}>
                <div>
                    <h2>{t(`ledger:${message}Title`)}</h2>
                    <p>{t(`ledger:${message}Explanation`)}</p>
                </div>
            </div>
        );
    }
}

export default translate()(Ledger);
