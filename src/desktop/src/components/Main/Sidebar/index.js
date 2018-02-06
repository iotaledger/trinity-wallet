import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import Icon from 'ui/components/Icon';

import css from '../../Layout/Main.css';

const images = {
    send: require('images/send-white.png'),
    receive: require('images/receive-white.png'),
    history: require('images/history-white.png'),
    settings: require('images/settings-white.png'),
};

class Sidebar extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };
    render() {
        const { t } = this.props;
        return (
            <div className={css.sidebar}>
                <nav>
                    <NavLink to="/balance">
                        <Icon icon="wallet" size={20} />
                        {t('home:balance')}
                    </NavLink>
                    <NavLink to="/send">
                        <Icon icon="send" size={20} />
                        {t('home:send')}
                    </NavLink>
                    <NavLink to="/receive">
                        <Icon icon="receive" size={20} />
                        {t('home:receive')}
                    </NavLink>
                    <NavLink to="/history">
                        <Icon icon="history" size={20} />
                        {t('home:history')}
                    </NavLink>
                    <NavLink to="/settings">
                        <Icon icon="settings" size={20} />
                        {t('home:settings')}
                    </NavLink>
                </nav>
            </div>
        );
    }
}

export default translate('sidebar')(Sidebar);
