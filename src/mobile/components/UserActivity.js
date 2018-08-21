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
        /** @ignore */
        setUserActivity: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        doNotMinimise: PropTypes.bool.isRequired,
        /** @ignore */
        isModalActive: PropTypes.bool.isRequired,
        /** @ignore */
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
