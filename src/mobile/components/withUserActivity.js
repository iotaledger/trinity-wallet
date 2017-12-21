import React, { Component } from 'react';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import { AppState } from 'react-native';
import { connect } from 'react-redux';

import { setUserActivity } from 'iota-wallet-shared-modules/actions/app';

const mapDispatchToProps = {
    setUserActivity,
};

export default () => C => {
    class withUserActivity extends Component {
        componentDidMount() {
            this.startBackgroundProcesses();
        }

        componentWillUnmount() {
            this.endBackgroundProcesses();
        }

        startBackgroundProcesses = () => {
            AppState.addEventListener('change', this.handleAppStateChange);
            timer.setInterval('polling', () => this.startAccountPolling(), 47000);
            timer.setInterval('chartPolling', () => this.startChartPolling(), 101000);
        };

        endBackgroundProcesses = () => {
            AppState.removeEventListener('change', this.handleAppStateChange);
            timer.clearInterval('polling');
            timer.clearInterval('chartPolling');
        };

        handleAppStateChange = nextAppState => {
            const { setUserActivity } = this.props;
            if (nextAppState.match(/inactive|background/)) {
                setUserActivity({ minimised: true });
                timer.setTimeout(
                    'background',
                    () => {
                        setUserActivity({ inactive: true });
                    },
                    30000,
                );
            } else if (nextAppState === 'active') {
                setUserActivity({ minimised: false });
                timer.clearTimeout('background');
            }
        };

        render() {
            return (
                <C
                    {...this.props}
                    endBackgroundProcesses={this.endBackgroundProcesses}
                    startBackgroundProcesses={this.startBackgroundProcesses}
                />
            );
        }
    }

    withUserActivity.propTypes = {
        setUserActivity: PropTypes.func.isRequired,
    };

    return connect(null, mapDispatchToProps)(withUserActivity);
};
