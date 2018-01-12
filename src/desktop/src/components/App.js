/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { persistStore } from 'redux-persist';
import { withRouter } from 'react-router-dom';
import store from 'store';
import i18next from 'libs/i18next';
import Loading from 'components/UI/Loading';
import Onboarding from 'components/Layout/Onboarding';
import Main from 'components/Layout/Main';
import Notifications from 'components/UI/Notifications';
import Alerts from 'components/UI/Alerts';

import './App.css';

class App extends React.Component {
    static propTypes = {
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
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.settings.locale !== this.props.settings.locale) {
            i18next.changeLanguage(nextProps.settings.locale);
        }
    }

    componentWillUnmount() {
        Electron.removeEvent('menu', this.onMenuToggle);
    }

    menuToggle(item) {
        switch (item) {
            case 'send':
                this.props.history.push('/send');
                break;
            case 'receive':
                this.props.history.push('/receive');
                break;
            case 'history':
                this.props.history.push('/history');
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

const mapStateToProps = (state) => ({
    settings: state.settings,
    app: state.app,
});

export default withRouter(connect(mapStateToProps)(App));
