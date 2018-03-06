/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import i18next from 'libs/i18next';
import { translate } from 'react-i18next';
import { clearTempData } from 'actions/tempAccount';
import { clearSeeds } from 'actions/seeds';

import Theme from 'ui/global/Theme';
import Alerts from 'ui/global/Alerts';
import Notifications from 'ui/global/Notifications';

import Loading from 'ui/components/Loading';
import Onboarding from 'ui/views/onboarding/Index';
import Wallet from 'ui/views/wallet/Index';
import { sendAmount } from 'actions/deepLinks';
import { ADDRESS_LENGTH } from 'libs/util';
import {ipcRenderer} from 'electron';

/** Main wallet wrapper component */
class App extends React.Component {
    static propTypes = {
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
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
        sendAmount: PropTypes.func.isRequired,
    };

    state = {
        initialized: false,
    };

    componentWillMount() {
        setTimeout(
            () =>
                this.setState(() => ({
                    initialized: true,
                })),
            3200,
        );
    }

    componentDidMount() {
        this.props.sendAmount(this.state.amount, this.state.address, this.state.message);
        ipcRenderer.on('url-params', (e, data) => {
            let regexAddress = /\:\/\/(.*?)\/\?/;
            let regexAmount = /amount=(.*?)\&/;
            let regexMessage = /message=([^\n\r]*)/;
            let address = data.match(regexAddress);
            if (address !== null) {
                let amount = data.match(regexAmount);
                let message = data.match(regexMessage);
                if (address[1].length !== ADDRESS_LENGTH) {
                    const { showError } = this.props;
                    showError({
                        title: 'send:invalidAddress',
                        text: 'send:invalidAddressExplanation1',
                        translate: true,
                    });
                    this.props.sendAmount(0, '', '');
                } else {
                    this.setState({
                        address: address[1],
                        amount: amount[1],
                        message: message[1],
                    });
                    this.props.sendAmount(this.state.amount, this.state.address, this.state.message);
                    if(this.props.tempAccount.ready === true) {
                        this.props.history.push('/send');
                    }
                }
            }
        });
        this.onMenuToggle = this.menuToggle.bind(this);
        Electron.onEvent('menu', this.onMenuToggle);
        Electron.changeLanguage(this.props.t);
        this.setState({
            address: '',
            amount: 0,
            message: '',
        });
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
            this.props.history.push('/wallet/balance');
        }
    }

    componentWillUnmount() {
        Electron.removeEvent('menu', this.onMenuToggle);
    }

    menuToggle(item) {
        switch (item) {
            case 'logout':
                this.props.clearTempData();
                this.props.clearSeeds();
                this.props.history.push('/login');
                break;
            default:
                this.props.history.push(`/${item}`);
                break;
        }
    }

    render() {
        const { account, tempAccount } = this.props;

        return (
            <div>
                <Theme />
                <Notifications />
                <Alerts />
                {!this.state.initialized ? (
                    <Loading loop={false} />
                ) : account.onboardingComplete && tempAccount.ready ? (
                    <Wallet />
                ) : (
                    <Onboarding complete={account.onboardingComplete} />
                )}
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
};

export default withRouter(translate()(connect(mapStateToProps, mapDispatchToProps)(App)));
