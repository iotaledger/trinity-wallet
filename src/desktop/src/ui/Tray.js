/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import i18next from 'libs/i18next';
import { translate } from 'react-i18next';

import Theme from 'ui/global/Theme';

import Balance from 'ui/components/Balance';
import List from 'ui/components/List';

import css from './tray.scss';

/**
 * Tray wallet wrapper component
 **/
class App extends React.Component {
    static propTypes = {
        /** @ignore */
        history: PropTypes.object.isRequired,
        /** @ignore */
        accounts: PropTypes.object.isRequired,
        /** @ignore */
        locale: PropTypes.string.isRequired,
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
        return <p>Login first</p>;
    }

    authorised() {
        const { accountIndex, historyItem } = this.state;

        return (
            <div>
                <Balance index={accountIndex} switchAccount={this.switchAccount} summary />
                <List
                    index={accountIndex}
                    setItem={(item) => this.setState({ historyItem: item })}
                    currentItem={historyItem}
                />
            </div>
        );
    }

    switchAccount = (nextIndex) => {
        const { accounts } = this.props;

        this.setState({
            accountIndex:
                nextIndex >= accounts.accountNames.length
                    ? -1
                    : nextIndex < -1 ? accounts.accountNames.length - 1 : nextIndex,
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
    locale: state.settings.locale,
    accounts: state.accounts,
});

export default withRouter(connect(mapStateToProps)(translate()(App)));
