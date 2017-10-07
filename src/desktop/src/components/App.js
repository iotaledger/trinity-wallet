import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'libs/i18next';
import Onboarding from './Layout/Onboarding';

import './App.css';

class App extends React.Component {

    static propTypes = {
        settings: PropTypes.shape({
            locale: PropTypes.string.isRequired,
            fullNode: PropTypes.string.isRequired,
        }).isRequired,
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.settings.locale !== this.props.settings.locale) {
            i18next.changeLanguage(nextProps.settings.locale);
        }
    }

    render() {
        return (
            <Onboarding />
        );
    }
}

const mapStateToProps = (state) => ({
    settings: state.settings,
});

export default connect(mapStateToProps)(App);
