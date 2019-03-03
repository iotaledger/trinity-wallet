/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';
import { zxcvbn } from 'libs/exports';

import { setAccountInfoDuringSetup } from 'actions/accounts';
import { generateAlert } from 'actions/alerts';
import { setPassword } from 'actions/wallet';

import SeedStore from 'libs/SeedStore';
import { hash, initKeychain, setTwoFA } from 'libs/crypto';
import { passwordReasons } from 'libs/password';

import Button from 'ui/components/Button';
import PasswordInput from 'ui/components/input/Password';

/**
 * Onboarding, Set account password
 */
class AccountPassword extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        setPassword: PropTypes.func.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        additionalAccountName: PropTypes.string.isRequired,
        /** @ignore */
        additionalAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
    };

    state = {
        password: '',
        passwordConfirm: '',
        loading: false,
    };

    componentWillUnmount() {
        setTimeout(() => Electron.garbageCollect(), 1000);
    }

    /**
     * Check for valid password, create new account, reset onboarding state
     * @returns {undefined}
     */
    createAccount = async (e) => {
        const { additionalAccountMeta, additionalAccountName, setPassword, history, generateAlert, t } = this.props;
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

        try {
            await initKeychain();
        } catch (e) {
            return generateAlert('error', t('errorAccessingKeychain'), t('errorAccessingKeychainExplanation'));
        }

        const passwordHash = await hash(password);

        await setTwoFA(passwordHash, null);
        setPassword(passwordHash);

        this.props.setAccountInfoDuringSetup({
            completed: true,
        });

        const seedStore = await new SeedStore[additionalAccountMeta.type](passwordHash);
        await seedStore.addAccount(additionalAccountName, Electron.getOnboardingSeed());

        Electron.setOnboardingSeed(null);

        history.push('/onboarding/done');
    };

    stepBack = (e) => {
        if (e) {
            e.preventDefault();
        }

        const { history } = this.props;

        if (Electron.getOnboardingGenerated()) {
            history.push('/onboarding/seed-verify');
        } else {
            history.push('/onboarding/account-name');
        }
    };

    render() {
        const { t, additionalAccountMeta } = this.props;

        const score = zxcvbn(this.state.password);

        return (
            <form onSubmit={(e) => this.createAccount(e)}>
                <section>
                    <h1>{t('setPassword:choosePassword')}</h1>
                    {additionalAccountMeta.type === 'keychain' && <p>{t('setPassword:anEncryptedCopy')}</p>}
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
                    <Button onClick={this.stepBack} className="square" variant="dark">
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
    additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta,
    additionalAccountName: state.accounts.accountInfoDuringSetup.name,
});

const mapDispatchToProps = {
    setPassword,
    generateAlert,
    setAccountInfoDuringSetup,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(AccountPassword));
