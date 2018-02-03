import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import Icon from 'components/UI/Icon';

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
                        <Icon icon="wallet" size={32} />
                        {t('home:balance')}
                    </NavLink>
                    <NavLink to="/send">
                        <img src={images.send} />
                        {t('home:send')}
                    </NavLink>
                    <NavLink to="/receive">
                        <img src={images.receive} />
                        {t('home:receive')}
                    </NavLink>
                    <NavLink to="/history">
                        <img src={images.history} />
                        {t('home:history')}
                    </NavLink>
                    <NavLink to="/settings">
                        <img src={images.settings} />
                        {t('home:settings')}
                    </NavLink>
                </nav>
            </div>
        );
    }
}

export default translate('sidebar')(Sidebar);
