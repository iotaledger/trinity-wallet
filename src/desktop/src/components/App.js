/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { persistStore } from 'redux-persist';
import { withRouter } from 'react-router-dom';
import store from 'store';
import i18next from 'libs/i18next';
import { translate } from 'react-i18next';
import Loading from 'components/UI/Loading';
import Onboarding from 'components/Layout/Onboarding';
import Main from 'components/Layout/Main';
import Theme from 'components/UI/Theme';
import Alerts from 'ui/views/global/Alerts';
import Notifications from 'ui/views/global/Notifications';

import './App.css';

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

        return (
            <div>
                {this.state.error && <p>{this.state.error.message}</p>}
                <Notifications />
                <Theme />
                <Alerts />
                {!this.state.initialized ? (
                    <Loading loop={false} />
                ) : app.isOnboardingCompleted ? (
                    <Main />
                ) : (
                    <Onboarding />
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    settings: state.settings,
    tempAccount: state.tempAccount,
    app: state.app,
});

export default withRouter(translate('onboardingComplete')(connect(mapStateToProps)(App)));
