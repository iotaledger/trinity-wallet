import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import { connect } from 'react-redux';
import { setUserActivity } from 'shared-modules/actions/ui';
import { clearWalletData } from 'shared-modules/actions/wallet';
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
                    navigator.setStackRoot('login');
                    delete global.passwordHash;

                    this.props.clearWalletData();
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
    };

    const mapDispatchToProps = {
        clearWalletData,
        setUserActivity,
    };

    return withTranslation(['global'])(connect(null, mapDispatchToProps)(WithLogout));
};
