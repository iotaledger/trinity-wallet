import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { persistStore } from 'redux-persist';
import { withRouter } from 'react-router-dom';
import store from '../store';
import i18next from 'libs/i18next';
import Loading from 'components/Layout/Loading';
import Onboarding from 'components/Layout/Onboarding';

import './App.css';

class App extends React.Component {

    static propTypes = {
        settings: PropTypes.shape({
            locale: PropTypes.string.isRequired,
            fullNode: PropTypes.string.isRequired,
        }).isRequired,
    };

    state = {
        initialized: false
    };

    componentWillMount() {
        persistStore(store, { blacklist: ['iota'] }, () => {
            this.setState(() => ({
                initialized: true,
            }));
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.settings.locale !== this.props.settings.locale) {
            i18next.changeLanguage(nextProps.settings.locale);
        }
    }

    render() {

        if (this.state.initialized === false) {
            return <Loading />;
        }

        return (
            <Onboarding />
        );

    }
}

const mapStateToProps = (state) => ({
    settings: state.settings,
});

export default withRouter(connect(mapStateToProps)(App));
