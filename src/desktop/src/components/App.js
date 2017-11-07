import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { persistStore } from 'redux-persist';
import { withRouter } from 'react-router-dom';
import store from '../store';
import i18next from 'libs/i18next';
import Loading from 'components/Layout/Loading';
import Onboarding from 'components/Layout/Onboarding';
import Notifications from 'components/UI/Notifications';

import './App.css';

class ErrorBoundary extends React.Component {
    static propTypes = {
        children: PropTypes.node,
    };

    state = {};

    componentDidCatch(error) {
        this.setState(() => ({
            error,
        }));
    }
    render() {
        if (this.state.error) {
            return <p>{this.state.error.message}</p>;
        }
        return this.props.children;
    }
}

class App extends React.Component {
    static propTypes = {
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
        persistStore(store, { blacklist: ['iota', 'notifications', 'seeds'] }, () => {
            setTimeout(
                () =>
                    this.setState(() => ({
                        initialized: true,
                    })),
                2500,
            );
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.settings.locale !== this.props.settings.locale) {
            i18next.changeLanguage(nextProps.settings.locale);
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
            return <Loading />;
        }

        return (
            <div>
                {this.state.error && <p>{this.state.error.message}</p>}
                <Notifications />
                {app.isOnboardingCompleted ? <div /> : <Onboarding />}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    app: state.app,
});

export default withRouter(connect(mapStateToProps)(App));
