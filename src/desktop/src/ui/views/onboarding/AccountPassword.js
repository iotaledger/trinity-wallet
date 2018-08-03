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

import { setSeed, setTwoFA, hash, clearVault } from 'libs/crypto';
import { passwordReasons } from 'libs/password';

import Button from 'ui/components/Button';
import PasswordInput from 'ui/components/input/Password';

/**
 * Onboarding, Set account password
 */
class AccountPassword extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        addAccountName: PropTypes.func.isRequired,
        /** @ignore */
        increaseSeedCount: PropTypes.func.isRequired,
        /** @ignore */
        seedCount: PropTypes.number.isRequired,
        /** @ignore */
        setPassword: PropTypes.func.isRequired,
        /** @ignore */
        setOnboardingName: PropTypes.func.isRequired,
        /** @ignore */
        setOnboardingComplete: PropTypes.func.isRequired,
        /** @ignore */
        onboarding: PropTypes.object.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        password: '',
        passwordConfirm: '',
        loading: false,
    };

    /**
     * Check for valid password, create new account, reset onboarding state
     * @returns {undefined}
     */
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

        if (seedCount === 0) {
            await clearVault(null, true);
        }

        const passwordHash = await hash(password);

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

export default connect(mapStateToProps, mapDispatchToProps)(translate()(AccountPassword));
