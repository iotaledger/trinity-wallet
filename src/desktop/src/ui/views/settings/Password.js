import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { showError, showNotification } from 'actions/notifications';

import { isValidPassword } from 'libs/util';
import { getSecurelyPersistedSeeds, securelyPersistSeeds } from 'libs/storage';

import Password from 'ui/components/input/Password';
import Button from 'ui/components/Button';

/**
 * User account password change component
 */
class SetPassword extends PureComponent {
    static propTypes = {
        /* Error helper function
         * @param {Object} content - Error notification content
         * @ignore
         */
        showError: PropTypes.func.isRequired,
        /* Notification helper function
         * @param {Object} content - Success notification content
         * @ignore
         */
        showNotification: PropTypes.func.isRequired,
        /* Translation helper
         * @param {string} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        passwordCurrent: '',
        passwordNew: '',
        passwordConfirm: '',
    };

    changePassword = () => {
        const { passwordCurrent, passwordNew, passwordConfirm } = this.state;
        const { showError, showNotification, t } = this.props;

        if (passwordNew !== passwordConfirm) {
            showError({
                title: t('changePassword:passwordsDoNotMatch'),
                text: t('changePassword:passwordsDoNotMatchExplanation'),
            });
            return;
        }

        if (!isValidPassword(passwordNew)) {
            showError({
                title: t('changePassword:passwordTooShort'),
                text: t('changePassword:passwordTooShortExplanation'),
            });
            return;
        }

        try {
            const seeds = getSecurelyPersistedSeeds(passwordCurrent);

            securelyPersistSeeds(passwordNew, seeds);

            this.setState({
                passwordCurrent: '',
                passwordNew: '',
                passwordConfirm: '',
            });

            showNotification({
                title: t('changePassword:passwordUpdated'),
                text: t('changePassword:passwordUpdatedExplanation'),
            });
        } catch (err) {
            showError({
                title: t('changePassword:incorrectPassword'),
                text: t('changePassword:incorrectPasswordExplanation'),
            });
            return;
        }
    };

    render() {
        const { t } = this.props;
        const { passwordCurrent, passwordNew, passwordConfirm } = this.state;

        return (
            <div>
                <Password
                    value={passwordCurrent}
                    label={t('changePassword:currentPassword')}
                    onChange={(value) => this.setState({ passwordCurrent: value })}
                />
                <Password
                    value={passwordNew}
                    label={t('changePassword:newPassword')}
                    onChange={(value) => this.setState({ passwordNew: value })}
                />
                <Password
                    value={passwordConfirm}
                    label={t('changePassword:confirmPassword')}
                    onChange={(value) => this.setState({ passwordConfirm: value })}
                />

                <Button onClick={() => this.changePassword()}>{t('settings:changePassword')}</Button>
            </div>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    showError,
    showNotification,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(SetPassword));
