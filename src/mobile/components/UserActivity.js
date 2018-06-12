import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import { AppState } from 'react-native';
import { connect } from 'react-redux';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { setUserActivity, toggleModalActivity } from 'iota-wallet-shared-modules/actions/ui';
import { isIOS } from '../utils/device';

export default () => (C) => {
    class WithUserActivity extends Component {
        componentDidMount() {
            AppState.addEventListener('change', this.handleAppStateChange);
        }

        componentWillUnmount() {
            AppState.removeEventListener('change', this.handleAppStateChange);
            timer.clearTimeout('background');
        }

        handleAppStateChange = (nextAppState) => {
            const { doNotMinimise, isModalActive } = this.props;
            if (nextAppState.match(/inactive|background/) && !doNotMinimise) {
                if (isIOS) {
                    this.props.setUserActivity({ minimised: true });
                }
                if (isModalActive) {
                    this.props.toggleModalActivity();
                }
            } else if (nextAppState === 'active') {
                if (isIOS) {
                    this.props.setUserActivity({ minimised: false });
                }
            }
        };

        render() {
            return <C {...this.props} />;
        }
    }

    WithUserActivity.propTypes = {
        /** Set application activity state
         * @param {object} options - minimised, active, inactive
         */
        setUserActivity: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /**
         * Disables app minimisation if necessary
         * @type {bool}
         */
        doNotMinimise: PropTypes.bool.isRequired,
        /** Determines whether modal is open */
        isModalActive: PropTypes.bool.isRequired,
        /** Sets whether modal is active or inactive */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    const mapDispatchToProps = {
        setUserActivity,
        generateAlert,
        toggleModalActivity,
    };

    const mapStateToProps = (state) => ({
        doNotMinimise: state.ui.doNotMinimise,
        isModalActive: state.ui.isModalActive,
    });

    return translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(WithUserActivity));
};
