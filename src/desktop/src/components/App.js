/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { persistStore } from 'redux-persist';
import { withRouter } from 'react-router-dom';
import store from 'store';
import { sendAmount } from 'actions/deepLinks';
import i18next from 'libs/i18next';
import { translate } from 'react-i18next';
import Loading from 'components/UI/Loading';
import Onboarding from 'components/Layout/Onboarding';
import Main from 'components/Layout/Main';
import Notifications from 'components/UI/Notifications';
import Alerts from 'components/UI/Alerts';

import './App.css';
import {ipcRenderer} from "electron";

class App extends React.Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        settings: PropTypes.shape({
            locale: PropTypes.string.isRequired,
            fullNode: PropTypes.string.isRequired,
        }).isRequired,
        app: PropTypes.shape({
            isOnboardingCompleted: PropTypes.bool.isRequired,
        }).isRequired,
        tempAccount: PropTypes.shape({
            ready: PropTypes.bool.isRequired}).isRequired,
        sendAmount: PropTypes.func.isRequired,

    };

    state = {
        initialized: false,
    };

    componentWillMount() {
        persistStore(store, { blacklist: ['tempAccount', 'notifications', 'seeds'] }, () => {
            setTimeout(
                () =>
                    this.setState(() => ({
                        initialized: true,
                    })),
                3200,
            );
        });
    }

    componentDidMount() {
        ipcRenderer.on('url-params', (e, data) => {
            console.log(this.props.tempAccount.ready);
            let regexAddress = /\:\/\/(.*?)\/\?/;
            let regexAmount = /amount=(.*?)\&/;
            let regexMessage = /message=([^\n\r]*)/;
            let address = data.match(regexAddress);
            if (address !== null) {
                let amount = data.match(regexAmount);
                let message = data.match(regexMessage);
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
        });
        this.onMenuToggle = this.menuToggle.bind(this);
        Electron.onEvent('menu', this.onMenuToggle);
        Electron.changeLanguage(this.props.t);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.settings.locale !== this.props.settings.locale) {
            i18next.changeLanguage(nextProps.settings.locale);
            Electron.changeLanguage(this.props.t);
        }
    }

    componentWillUnmount() {
        Electron.removeEvent('menu', this.onMenuToggle);
    }

    menuToggle(item) {
        switch (item) {
            case 'logout':
                this.props.history.push('/login');
                break;
            default:
                this.props.history.push(`/${item}`);
                break;
        }
    }

    componentDidCatch(error) {
        this.setState(() => ({
            error,
        }));
    }

    render() {
        const { app } = this.props;

        if (this.state.initialized === false) {
            return <Loading loop={false} />;
        }

        return (
            <div>
                {this.state.error && <p>{this.state.error.message}</p>}
                <Notifications />
                <Alerts />
                {app.isOnboardingCompleted ? <Main /> : <Onboarding />}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    tempAccount: state.tempAccount,
    app: state.app,
    account: state.account,
    deepLinks: state.deepLinks,
});

const mapDispatchToProps = {
    sendAmount,
};

export default withRouter(translate('onboardingComplete')(connect(mapStateToProps, mapDispatchToProps)(App)));
