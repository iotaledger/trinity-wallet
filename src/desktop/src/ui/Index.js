/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import i18next from 'libs/i18next';
import { translate } from 'react-i18next';

import { clearWalletData } from 'actions/wallet';
import { getUpdateData } from 'actions/settings';
import { clearSeeds } from 'actions/seeds';
import { disposeOffAlert } from 'actions/alerts';

import Theme from 'ui/global/Theme';
import Alerts from 'ui/global/Alerts';
import Updates from 'ui/global/Updates';

import Loading from 'ui/components/Loading';

import Onboarding from 'ui/views/onboarding/Index';
import Wallet from 'ui/views/wallet/Index';
import Settings from 'ui/views/settings/Index';
import Account from 'ui/views/account/Index';
import Activation from 'ui/views/onboarding/Activation';

import css from './index.css';

/** Main wallet wrapper component */
class App extends React.Component {
    static propTypes = {
        /** Alpha versiona ctivation code */
        activationCode: PropTypes.string,
        /** Browser location */
        location: PropTypes.object,
        /** Browser histoty object */
        history: PropTypes.object.isRequired,
        /** Settings state state data
         * @ignore
         */
        settings: PropTypes.object.isRequired,
        /** Accounts state state data
         * @ignore
         */
        accounts: PropTypes.object.isRequired,
        /** wallet state data
         * @ignore
         */
        wallet: PropTypes.object.isRequired,
        /** Clear  alert state data
         * @ignore
         */
        disposeOffAlert: PropTypes.func.isRequired,
        /** Clear wallet state data
         * @ignore
         */
        clearWalletData: PropTypes.func.isRequired,
        /** Clear temporary seed state data
         * @ignore
         */
        clearSeeds: PropTypes.func.isRequired,
        /** Initiate update check
         * @param {Boolean} force - Force update confirmation dialog
         * @ignore
         */
        getUpdateData: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = { uuid: null };
    }

    componentDidMount() {
        this.onMenuToggle = this.menuToggle.bind(this);
        Electron.onEvent('menu', this.onMenuToggle);
        Electron.changeLanguage(this.props.t);

        Electron.getUuid().then((uuid) => {
            this.setState({
                uuid: uuid,
            });
        });
    }

    componentWillReceiveProps(nextProps) {
        /* On language change */
        if (nextProps.settings.locale !== this.props.settings.locale) {
            i18next.changeLanguage(nextProps.settings.locale);
            Electron.changeLanguage(this.props.t);
        }
        /* On Login */
        if (!this.props.wallet.ready && nextProps.wallet.ready) {
            Electron.updateMenu('authorised', true);
            this.props.history.push('/wallet/');
        }

        if (this.props.location.pathname !== nextProps.location.pathname) {
            this.props.disposeOffAlert();
        }
    }

    componentWillUnmount() {
        Electron.removeEvent('menu', this.onMenuToggle);
    }

    menuToggle(item) {
        switch (item) {
            case 'addAccount':
                this.props.history.push('/onboarding/seed-intro');
                break;
            case 'update':
                this.props.getUpdateData(true);
                break;
            case 'logout':
                this.props.clearWalletData();
                this.props.clearSeeds();
                this.props.history.push('/onboarding/login');
                break;
            default:
                this.props.history.push(`/${item}`);
                break;
        }
    }

    Init = (props) => {
        return <Loading inline {...props} loop={false} onEnd={() => this.props.history.push('/onboarding/')} />;
    };

    render() {
        const { accounts, location, activationCode } = this.props;

        const currentKey = location.pathname.split('/')[1] || '/';

        if (!this.state.uuid) {
            return null;
        }

        if (!activationCode) {
            return (
                <div className={css.trintiy}>
                    <Theme />
                    <Alerts />
                    <Activation uuid={this.state.uuid} />
                </div>
            );
        }

        return (
            <div className={css.trintiy}>
                <Theme />
                <Alerts />
                <Updates />
                <TransitionGroup>
                    <CSSTransition key={currentKey} classNames="fade" timeout={300}>
                        <div>
                            <Switch location={location}>
                                <Route exact path="/settings/:setting?" component={Settings} />
                                <Route exact path="/account/:setting?" component={Account} />
                                <Route path="/wallet" component={Wallet} />
                                <Route
                                    path="/onboarding"
                                    complete={accounts.onboardingComplete}
                                    component={Onboarding}
                                />
                                <Route exact path="/" loop={false} component={this.Init} />
                            </Switch>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    settings: state.settings,
    accounts: state.accounts,
    wallet: state.wallet,
    activationCode: state.app.activationCode,
});

const mapDispatchToProps = {
    clearWalletData,
    clearSeeds,
    getUpdateData,
    disposeOffAlert,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(translate()(App)));
