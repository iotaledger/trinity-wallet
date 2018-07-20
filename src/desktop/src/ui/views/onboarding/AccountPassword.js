/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { zxcvbn } from 'libs/exports';

import { generateAlert } from 'actions/alerts';
import { addAccountName, increaseSeedCount, setOnboardingComplete } from 'actions/accounts';
import { setPassword } from 'actions/wallet';
import { setOnboardingName } from 'actions/ui';

import { setSeed, setTwoFA, sha256, clearVault } from 'libs/crypto';
import { passwordReasons } from 'libs/password';

import Button from 'ui/components/Button';
import PasswordInput from 'ui/components/input/Password';

/**
 * Onboarding, set account password
 */
class AccountPassword extends React.PureComponent {
    static propTypes = {
        /** Add new account name
         * @param {String} name - Account name
         */
        addAccountName: PropTypes.func.isRequired,
        /** Increase seed count
         */
        increaseSeedCount: PropTypes.func.isRequired,
        /** Current seed count */
        seedCount: PropTypes.number.isRequired,
        /** Set password state
         * @param {String} password - Current password
         * @ignore
         */
        setPassword: PropTypes.func.isRequired,
        /** Set onboarding account name
         * @param {String} name - New accounts name
         */
        setOnboardingName: PropTypes.func.isRequired,
        /** Set onboarding status to complete */
        setOnboardingComplete: PropTypes.func.isRequired,
        /** Onboarding set seed and name */
        onboarding: PropTypes.object.isRequired,
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        password: '',
        passwordConfirm: '',
        loading: false,
    };

    createAccount = async (e) => {
        const {
            setPassword,
            addAccountName,
            increaseSeedCount,
            setOnboardingName,
            setOnboardingComplete,
            seedCount,
            history,
            generateAlert,
            onboarding,
            t,
        } = this.props;
        const { password, passwordConfirm } = this.state;

        if (e) {
            e.preventDefault();
        }

        if (this.state.loading) {
            return;
        }

        const score = zxcvbn(password);

        if (score.score < 4) {
            const reason = score.feedback.warning
                ? t(`changePassword:${passwordReasons[score.feedback.warning]}`)
                : t('changePassword:passwordTooWeakReason');

            return generateAlert('error', t('changePassword:passwordTooWeak'), reason);
        }

        if (password !== passwordConfirm) {
            return generateAlert(
                'error',
                t('changePassword:passwordsDoNotMatch'),
                t('changePassword:passwordsDoNotMatchExplanation'),
            );
        }

        this.setState({
            loading: true,
        });

        const passwordHash = await sha256(password);

        if (seedCount === 0) {
            await clearVault(null, true);
        }
        increaseSeedCount();

        addAccountName(onboarding.name);
        setPassword(passwordHash);

        await setSeed(passwordHash, onboarding.name, Electron.getOnboardingSeed());
        await setTwoFA(passwordHash, null);
        Electron.setOnboardingSeed(null);

        setOnboardingName('');
        setOnboardingComplete(true);

        history.push('/onboarding/done');
    };

    render() {
        const { t } = this.props;

        const score = zxcvbn(this.state.password);

        return (
            <form onSubmit={(e) => this.createAccount(e)}>
                <section>
                    <h1>{t('setPassword:choosePassword')}</h1>
                    <p>{t('setPassword:anEncryptedCopy')}</p>
                    <PasswordInput
                        focus
                        value={this.state.password}
                        label={t('password')}
                        showScore
                        showValid
                        onChange={(value) => this.setState({ password: value })}
                    />
                    <PasswordInput
                        value={this.state.passwordConfirm}
                        label={t('setPassword:retypePassword')}
                        showValid
                        disabled={score.score < 4}
                        match={this.state.password}
                        onChange={(value) => this.setState({ passwordConfirm: value })}
                    />
                </section>
                <footer>
                    <Button to="/onboarding/account-name" className="square" variant="dark">
                        {t('goBackStep')}
                    </Button>
                    <Button type="submit" className="square" variant="primary">
                        {t('continue')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    onboarding: state.ui.onboarding,
    seedCount: state.accounts.accountNames.length,
});

const mapDispatchToProps = {
    setPassword,
    addAccountName,
    setOnboardingName,
    setOnboardingComplete,
    generateAlert,
    increaseSeedCount,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(translate()(AccountPassword));
