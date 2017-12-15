import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Link from './Link';
import css from '../../Layout/Main.css';

const images = {
    balance: require('images/balance.png'),
    send: require('images/send.png'),
    receive: require('images/receive.png'),
    history: require('images/history.png'),
    settings: require('images/settings.png'),
};

class Sidebar extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };
    render() {
        // eslint-disable-next-line
        const { t } = this.props;
        return (
            <div className={css.sidebar}>
                <nav>
                    <Link to="/balance" image={images.balance}>
                        Balance
                    </Link>

                    <Link to="/send" image={images.send}>
                        Send
                    </Link>

                    <Link to="/receive" image={images.receive}>
                        Receive
                    </Link>

                    <Link to="/history" image={images.history}>
                        History
                    </Link>

                    <Link to="/settings" image={images.settings}>
                        Settings
                    </Link>
                </nav>
            </div>
        );
    }
}

export default translate('sidebar')(Sidebar);
