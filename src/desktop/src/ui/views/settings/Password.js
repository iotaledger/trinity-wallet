import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { generateAlert } from 'actions/alerts';

import { isValidPassword } from 'libs/util';
import { setVault } from 'libs/crypto';

import Password from 'ui/components/input/Password';
import Button from 'ui/components/Button';

/**
 * User account password change component
 */
class SetPassword extends PureComponent {
    static propTypes = {
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
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
        const { generateAlert, t } = this.props;

        if (passwordNew !== passwordConfirm) {
            generateAlert(
                'error',
                t('changePassword:passwordsDoNotMatch'),
                t('changePassword:passwordsDoNotMatchExplanation'),
            );
            return;
        }

        if (!isValidPassword(passwordNew)) {
            generateAlert(
                'error',
                t('changePassword:passwordTooShort'),
                t('changePassword:passwordTooShortExplanation'),
            );
            return;
        }

        try {
            setVault(passwordCurrent, passwordNew);

            this.setState({
                passwordCurrent: '',
                passwordNew: '',
                passwordConfirm: '',
            });

            generateAlert(
                'success',
                t('changePassword:passwordUpdated'),
                t('changePassword:passwordUpdatedExplanation'),
            );
        } catch (err) {
            generateAlert(
                'error',
                t('changePassword:incorrectPassword'),
                t('changePassword:incorrectPasswordExplanation'),
            );
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

const mapDispatchToProps = {
    generateAlert,
};

export default connect(null, mapDispatchToProps)(translate()(SetPassword));
