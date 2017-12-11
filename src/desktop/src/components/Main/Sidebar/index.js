import React from 'react';
// import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Link from './Link';
import css from '../../Layout/Main.css';

const images = {
    balance: require('../../../../../shared/images/balance.png'),
    send: require('../../../../../shared/images/send.png'),
    receive: require('../../../../../shared/images/receive.png'),
    settings: require('../../../../../shared/images/settings.png'),
};

class Sidebar extends React.Component {
    static propTypes = {};

    render() {
        return (
            <div className={css.sidebar}>
                <ul>
                    <li>
                        <Link to="/balance" image={images.balance}>
                            Balance
                        </Link>
                    </li>
                    <li>
                        <Link to="/send" image={images.send}>
                            Send
                        </Link>
                    </li>
                    <li>
                        <Link to="/receive" image={images.receive}>
                            Receive
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings" image={images.settings}>
                            Settings
                        </Link>
                    </li>
                </ul>
            </div>
        );
    }
}

export default translate('sidebar')(Sidebar);
