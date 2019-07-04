import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { zxcvbn } from 'libs/exports';

import { generateAlert } from 'actions/alerts';
import { setPassword } from 'actions/wallet';

import passwordReasons from 'libs/password';
import SeedStore from 'libs/SeedStore';
import { hash } from 'libs/crypto';

import Password from 'ui/components/input/Password';
import Button from 'ui/components/Button';

/**
 * User account password change component
 */
class PasswordSettings extends PureComponent {
    static propTypes = {
        /** @ignore */
        accounts: PropTypes.object.isRequired,
        /** @ignore */
        setPassword: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        passwordCurrent: '',
        passwordNew: '',
        passwordConfirm: '',
    };

    /**
     * Check for a valid password, update vault and state
     * @param {event} event - Form submit event
     */
    changePassword = async (event) => {
        event.preventDefault();

        const { passwordCurrent, passwordNew, passwordConfirm } = this.state;
        const { accounts, setPassword, generateAlert, t } = this.props;

        if (passwordNew !== passwordConfirm) {
            generateAlert(
                'error',
                t('changePassword:passwordsDoNotMatch'),
                t('changePassword:passwordsDoNotMatchExplanation'),
            );
            return;
        }

        const score = zxcvbn(passwordNew);

        if (score.score < 4) {
            const reason = score.feedback.warning
                ? t(`changePassword:${passwordReasons[score.feedback.warning]}`)
                : t('changePassword:passwordTooWeakReason');

            return generateAlert('error', t('changePassword:passwordTooWeak'), reason);
        }

        try {
            const passwordNewHash = await hash(passwordNew);
            const passwordCurrentHash = await hash(passwordCurrent);

            const accountTypes = Object.keys(accounts)
                .map((accountName) => (accounts[accountName].meta ? accounts[accountName].meta.type : 'keychain'))
                .filter((accountType, index, accountTypes) => accountTypes.indexOf(accountType) === index);

            if (accountTypes.indexOf('keychain') < 0) {
                accountTypes.push('keychain');
            }

            for (let i = 0; i < accountTypes.length; i++) {
                await SeedStore[accountTypes[i]].updatePassword(passwordCurrentHash, passwordNewHash);
            }

            setPassword(passwordNewHash);

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
            <form onSubmit={(e) => this.changePassword(e)}>
                <fieldset>
                    <Password
                        value={passwordCurrent}
                        label={t('changePassword:currentPassword')}
                        onChange={(value) => this.setState({ passwordCurrent: value })}
                    />
                    <Password
                        showScore
                        value={passwordNew}
                        label={t('changePassword:newPassword')}
                        onChange={(value) => this.setState({ passwordNew: value })}
                    />
                    <Password
                        value={passwordConfirm}
                        label={t('changePassword:confirmPassword')}
                        onChange={(value) => this.setState({ passwordConfirm: value })}
                    />
                </fieldset>
                <footer>
                    <Button
                        className="square"
                        type="submit"
                        disabled={!passwordCurrent.length || !passwordNew.length || !passwordConfirm.length}
                    >
                        {t('settings:changePassword')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    accounts: state.accounts.accountInfo,
});

const mapDispatchToProps = {
    generateAlert,
    setPassword,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(PasswordSettings));
