import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import { AppState } from 'react-native';
import { connect } from 'react-redux';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { setUserActivity } from 'iota-wallet-shared-modules/actions/tempAccount';

const mapDispatchToProps = {
    setUserActivity,
    generateAlert,
};

const mapStateToProps = state => ({
    isSyncing: state.tempAccount.isSyncing,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
});

export default () => C => {
    class withUserActivity extends Component {
        componentDidMount() {
            AppState.addEventListener('change', this.handleAppStateChange);
        }

        componentWillUnmount() {
            AppState.removeEventListener('change', this.handleAppStateChange);
        }

        handleAppStateChange = nextAppState => {
            const { isSyncing, isSendingTransfer } = this.props;
            if (nextAppState.match(/inactive|background/)) {
                this.props.setUserActivity({ minimised: true });
                timer.setTimeout(
                    'background',
                    () => {
                        if (!isSyncing && !isSendingTransfer) {
                            this.props.setUserActivity({ inactive: true });
                        }
                    },
                    30000,
                );
            } else if (nextAppState === 'active') {
                this.props.setUserActivity({ minimised: false });
                timer.clearTimeout('background');
            }
        };

        render() {
            return <C {...this.props} />;
        }
    }

    withUserActivity.propTypes = {
        setUserActivity: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        isSyncing: PropTypes.bool.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
    };

    return translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(withUserActivity));
};
