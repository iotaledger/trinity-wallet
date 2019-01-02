/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import i18next from 'libs/i18next';
import { withI18n } from 'react-i18next';

import { capitalize } from 'libs/iota/converter';

import Theme from 'ui/global/Theme';

import Balance from 'ui/components/Balance';
import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import Logo from 'ui/components/Logo';
import List from 'ui/components/List';

import css from './tray.scss';

/**
 * Tray wallet wrapper component
 **/
class App extends React.Component {
    static propTypes = {
        /** @ignore */
        complete: PropTypes.bool,
        /** @ignore */
        history: PropTypes.object.isRequired,
        /** @ignore */
        accounts: PropTypes.object.isRequired,
        /** @ignore */
        locale: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            authorised: false,
            accountIndex: -1,
            historyItem: null,
        };
    }

    componentDidMount() {
        this.onMenuUpdate = this.menuUpdate.bind(this);

        Electron.onEvent('menu.update', this.onMenuUpdate);
    }

    componentWillReceiveProps(nextProps) {
        /* On language change */
        if (nextProps.locale !== this.props.locale) {
            i18next.changeLanguage(nextProps.locale);
        }
    }

    /**
     * Proxy menu update event to an action
     * @param {Object} payload - Menu update object {attribute, value}
     */
    menuUpdate(payload) {
        switch (payload.attribute) {
            case 'authorised':
                this.setState({
                    authorised: payload.value,
                });
                break;
        }
    }

    unauthorised() {
        const { complete, t } = this.props;

        return (
            <div className={css.intro}>
                <Logo size={72} animate loop />
                <h2>{complete ? t('tray:notLoggedIn') : t('tray:setupIncomplete')}</h2>
                <Button onClick={() => Electron.focus()}>
                    {complete ? t('login:login') : t('tray:completeSetup')}
                </Button>
            </div>
        );
    }

    authorised() {
        const { t } = this.props;
        const { accountIndex, historyItem } = this.state;

        return (
            <React.Fragment>
                <Balance index={accountIndex} switchAccount={this.switchAccount} summary />
                <List
                    index={accountIndex}
                    setItem={(item) => this.setState({ historyItem: item })}
                    currentItem={historyItem}
                />
                <nav>
                    <a onClick={() => Electron.focus('wallet/send')}>
                        <Icon icon="send" size={18} />
                        {capitalize(t('home:send'))}
                    </a>
                    <a onClick={() => Electron.focus('wallet/receive')}>
                        <Icon icon="receive" size={18} />
                        {capitalize(t('home:receive'))}
                    </a>
                </nav>
            </React.Fragment>
        );
    }

    switchAccount = (nextIndex) => {
        const { accounts } = this.props;

        const accountCount = Object.keys(accounts.accountInfo).length;

        this.setState({
            accountIndex: nextIndex >= accountCount ? -1 : nextIndex < -1 ? accountCount - 1 : nextIndex,
        });
    };

    render() {
        const { authorised } = this.state;
        const { history } = this.props;

        return (
            <div className={css.tray}>
                <Theme history={history} />
                {!authorised ? this.unauthorised() : this.authorised()}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    complete: state.accounts.onboardingComplete,
    locale: state.settings.locale,
    accounts: state.accounts,
});

export default withRouter(connect(mapStateToProps)(withI18n()(App)));
