import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import { connect } from 'react-redux';
import { generateAlert } from 'shared-modules/actions/alerts';
import { hash } from 'libs/keychain';
import { setUserActivity } from 'shared-modules/actions/ui';
import { clearWalletData } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { navigator } from 'libs/navigation';

export default () => (C) => {
    class WithLogout extends Component {
        constructor() {
            super();
            this.onInactivityLoginPress = this.onInactivityLoginPress.bind(this);
            this.logout = this.logout.bind(this);
        }

        /**
         * Validates user provided password and sets wallet state as active
         * @param {string} password
         * @returns {Promise<void>}
         */
        async onInactivityLoginPress(password) {
            const { t } = this.props;
            if (!password) {
                return this.props.generateAlert('error', t('login:emptyPassword'), t('login:emptyPasswordExplanation'));
            }
            const passwordHash = await hash(password);
            if (!isEqual(passwordHash, global.passwordHash)) {
                this.props.generateAlert(
                    'error',
                    t('global:unrecognisedPassword'),
                    t('global:unrecognisedPasswordExplanation'),
                );
            } else {
                this.props.setUserActivity({ inactive: false });
            }
        }

        /**
         * Clears temporary wallet data and navigates to login screen
         * @method logout
         */
        logout() {
            const { theme: { body } } = this.props;
            timer.setTimeout(
                'delayLogout',
                () => {
                    navigator.setStackRoot('login', {
                        animations: {
                            setStackRoot: {
                                enable: false,
                            },
                        },
                        layout: {
                            backgroundColor: body.bg,
                            orientation: ['portrait'],
                        },
                        statusBar: {
                            backgroundColor: body.bg,
                        },
                    });
                    delete global.passwordHash;
                    // gc
                    this.props.clearWalletData();
                },
                500,
            );
        }

        render() {
            return <C {...this.props} logout={this.logout} onInactivityLoginPress={this.onInactivityLoginPress} />;
        }
    }

    WithLogout.propTypes = {
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        clearWalletData: PropTypes.func.isRequired,
        /** @ignore */
        setUserActivity: PropTypes.func.isRequired,
    };

    const mapDispatchToProps = {
        generateAlert,
        clearWalletData,
        setUserActivity,
    };

    const mapStateToProps = (state) => ({
        theme: getThemeFromState(state),
    });

    return withNamespaces(['global'])(connect(mapStateToProps, mapDispatchToProps)(WithLogout));
};
