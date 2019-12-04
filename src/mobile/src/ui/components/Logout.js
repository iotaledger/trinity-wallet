import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import { connect } from 'react-redux';
import { setUserActivity } from 'shared-modules/actions/ui';
import { clearWalletData } from 'shared-modules/actions/wallet';
import {
    setAuthenticationStatus as setMoonPayAuthenticationStatus,
    clearData as clearMoonPayData,
} from 'shared-modules/actions/exchanges/MoonPay';
import { __DEV__ } from 'shared-modules/config';
import { MoonPayKeychainAdapter } from 'libs/keychain';
import navigator from 'libs/navigation';

export default () => (C) => {
    class WithLogout extends Component {
        constructor() {
            super();
            this.logout = this.logout.bind(this);
        }

        /**
         * Clears temporary wallet data and navigates to login screen
         * @method logout
         */
        logout() {
            timer.setTimeout(
                'delayLogout',
                () => {
                    MoonPayKeychainAdapter.clear()
                        .then(() => {
                            navigator.setStackRoot('login');
                            delete global.passwordHash;

                            this.props.clearMoonPayData();
                            this.props.clearWalletData();
                            this.props.setMoonPayAuthenticationStatus(false);
                        })
                        .catch((error) => {
                            if (__DEV__) {
                                /* eslint-disable no-console */
                                console.log(error);
                                /* eslint-enable no-console */
                            }
                        });
                },
                500,
            );
        }

        render() {
            return <C {...this.props} logout={this.logout} />;
        }
    }

    WithLogout.propTypes = {
        /** @ignore */
        clearWalletData: PropTypes.func.isRequired,
        /** @ignore */
        setUserActivity: PropTypes.func.isRequired,
        /** @ignore */
        setMoonPayAuthenticationStatus: PropTypes.func.isRequired,
        /** @ignore */
        clearMoonPayData: PropTypes.func.isRequired,
    };

    const mapDispatchToProps = {
        clearWalletData,
        setUserActivity,
        setMoonPayAuthenticationStatus,
        clearMoonPayData,
    };

    return withTranslation(['global'])(connect(null, mapDispatchToProps)(WithLogout));
};
