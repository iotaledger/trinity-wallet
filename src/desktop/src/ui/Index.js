/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import i18next from 'libs/i18next';
import { translate } from 'react-i18next';
import { clearTempData } from 'actions/tempAccount';
import { getUpdateData } from 'actions/settings';
import { clearSeeds } from 'actions/seeds';
import { generateAlert } from 'actions/alerts';
import Theme from 'ui/global/Theme';
import Alerts from 'ui/global/Alerts';
import Updates from 'ui/global/Updates';
import Loading from 'ui/components/Loading';
import { sendAmount } from 'actions/deepLinks';
import { ADDRESS_LENGTH } from 'libs/util';
import Onboarding from 'ui/views/onboarding/Index';
import Wallet from 'ui/views/wallet/Index';
import Settings from 'ui/views/settings/Index';
import Account from 'ui/views/account/Index';

import css from './index.css';

/** Main wallet wrapper component */
class App extends React.Component {
    static propTypes = {
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
        account: PropTypes.object.isRequired,
        /** Temporary account state data
         * @ignore
         */
        tempAccount: PropTypes.object.isRequired,
        /** Clear temporary account state data
         * @ignore
         */
        clearTempData: PropTypes.func.isRequired,
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
        sendAmount: PropTypes.func.isRequired,
    };

    componentWillMount() {
        const { generateAlert, t } = this.props;
        Electron.onEvent('url-params', (data) => {
            let regexAddress = /\:\/\/(.*?)\/\?/;
            let regexAmount = /amount=(.*?)\&/;
            let regexMessage = /message=([^\n\r]*)/;
            let address = data.match(regexAddress);
            if (address !== null) {
                let amount = data.match(regexAmount);
                let message = data.match(regexMessage);
                if (address[1].length !== ADDRESS_LENGTH) {
                    generateAlert('error', t('send:invalidAddress'), t('send:invalidAddressExplanation1'));
                    this.props.sendAmount(0, '', '');
                } else {
                    this.setState({
                        address: address[1],
                        amount: amount[1],
                        message: message[1],
                    });
                    this.props.sendAmount(this.state.amount, this.state.address, this.state.message);
                    if(this.props.tempAccount.ready === true) {
                        const { generateAlert} = this.props;
                        generateAlert('success', 'Link', 'Send amount was updated.');
                        this.props.history.push('/wallet/send');
                    }
                }
            }
        });
    }

    componentDidMount() {
        this.onMenuToggle = this.menuToggle.bind(this);
        Electron.onEvent('menu', this.onMenuToggle);
        Electron.changeLanguage(this.props.t);
        Electron.refreshDeepLink();
    }


    componentWillReceiveProps(nextProps) {
        /* On language change */
        if (nextProps.settings.locale !== this.props.settings.locale) {
            i18next.changeLanguage(nextProps.settings.locale);
            Electron.changeLanguage(this.props.t);
        }
        /* On Login */
        if (!this.props.tempAccount.ready && nextProps.tempAccount.ready) {
            Electron.updateMenu('authorised', true);
            this.props.history.push('/wallet/');
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
                this.props.clearTempData();
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
        const { account, location } = this.props;

        const currentKey = location.pathname.split('/')[1] || '/';

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
                                    complete={account.onboardingComplete}
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
    account: state.account,
    tempAccount: state.tempAccount,
    deepLinks: state.deepLinks,
});

const mapDispatchToProps = {
    clearTempData,
    clearSeeds,
    sendAmount,
    getUpdateData,
    generateAlert,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(translate()(App)));
