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
        view: null
    };

    componentDidMount() {
        this.messageEvent = this.onMessage.bind(this);
        Electron.onEvent('ledger', this.messageEvent);
    }

    componentWillUnmount() {
        Electron.removeEvent('ledger', this.messageEvent);
    }

    onMessage(message) {
        let view = null;

        if (message.awaitConnection) {
            view = 'connection';
        } else if (message.awaitApplication) {
            view = 'application';
        } else if (message.awaitTransaction) {
            view = 'transaction';
        }

        this.setState({
            view
        });
    }

    render() {
        const { t } = this.props;
        const { view } = this.state;

        return (
            <div className={classNames(css.modal, view ? css.on : null)}>
                <div>
                    <h2>{t(`ledger:${view}Title`)}</h2>
                    <p>{t(`ledger:${view}Explanation`)}</p>
                </div>
            </div>
        );
    }
}

export default translate()(Ledger);
