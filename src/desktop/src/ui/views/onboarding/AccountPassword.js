import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import sjcl from 'sjcl';

import { generateAlert } from 'actions/alerts';
import { addAccountName } from 'actions/accounts';
import { setAdditionalAccountInfo, setSeedIndex, setPassword } from 'actions/wallet';
import { setOnboardingSeed, setOnboardingName } from 'actions/ui';

import { isValidPassword } from 'libs/utils';
import { setVault, getVault } from 'libs/crypto';

import Button from 'ui/components/Button';
import Infobox from 'ui/components/Info';
import PasswordInput from 'ui/components/input/Password';
import ModalPassword from 'ui/components/modal/Password';

/**
 * Onboarding, set account password
 */
class AccountPassword extends React.PureComponent {
    static propTypes = {
        /** If first account is beeing created */
        firstAccount: PropTypes.bool.isRequired,
        /** Add new account name
         * @param {String} name - Account name
         */
        addAccountName: PropTypes.func.isRequired,
        /** Set additional account info
         * @param {Object} data - Additional account data
         */
        setAdditionalAccountInfo: PropTypes.func.isRequired,
        /** Set password state
         * @param {String} password - Current password
         * @ignore
         */
        setPassword: PropTypes.func.isRequired,
        /** Set onboarding account name
         * @param {String} name - New accounts name
         */
        setOnboardingName: PropTypes.func.isRequired,
        /** Set onboarding seed state
         * @param {String} seed - New seed
         * @param {Boolean} isGenerated - Is the new seed generated
         */
        setOnboardingSeed: PropTypes.func.isRequired,
        /** Onboarding set seed and name */
        onboarding: PropTypes.object.isRequired,
        /** Set seed index state
         *  @param {Number} Index - Seed index
         */
        setSeedIndex: PropTypes.func.isRequired,
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
    };

    createAccount = async (e) => {
        const {
            firstAccount,
            setPassword,
            addAccountName,
            setAdditionalAccountInfo,
            setSeedIndex,
            setOnboardingSeed,
            setOnboardingName,
            history,
            generateAlert,
            onboarding,
            t,
        } = this.props;
        const { password, passwordConfirm } = this.state;

        if (e) {
            e.preventDefault();
        }

        if (firstAccount && password !== passwordConfirm) {
            return generateAlert(
                'error',
                t('changePassword:passwordsDoNotMatch'),
                t('changePassword:passwordsDoNotMatchExplanation'),
            );
        }

        if (firstAccount && !isValidPassword(password)) {
            return generateAlert(
                'error',
                t('changePassword:passwordTooShort'),
                t('changePassword:passwordTooShortExplanation'),
            );
        }

        let newSeeds = [onboarding.seed];
        const passwordHash = firstAccount ? sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(password)) : password;

        if (!firstAccount) {
            const vault = await getVault(passwordHash);
            newSeeds = [].concat(vault.seeds, onboarding.seed);
        }

        addAccountName(onboarding.name);

        setSeedIndex(newSeeds.length - 1);
        setPassword(passwordHash);

        setOnboardingSeed(null);
        setOnboardingName('');

        await setVault(passwordHash, { seeds: newSeeds }, firstAccount);

        if (!firstAccount) {
            setAdditionalAccountInfo({
                addingAdditionalAccount: true,
                additionalAccountName: onboarding.name,
            });
            history.push('/onboarding/login');
        } else {
            history.push('/onboarding/done');
        }
    };

    render() {
        const { firstAccount, history, t } = this.props;

        if (!firstAccount) {
            return (
                <ModalPassword
                    isOpen
                    inline
                    onSuccess={(password) => {
                        this.setState(
                            {
                                password: password,
                            },
                            () => this.createAccount(),
                        );
                    }}
                    onClose={() => history.push('/wallet/')}
                    content={{
                        title: t('Enter password to add the new account'),
                    }}
                />
            );
        }

        return (
            <form onSubmit={(e) => this.createAccount(e)}>
                <section>
                    <PasswordInput
                        focus
                        value={this.state.password}
                        label={t('password')}
                        onChange={(value) => this.setState({ password: value })}
                    />
                    <PasswordInput
                        value={this.state.passwordConfirm}
                        label={t('setPassword:retypePassword')}
                        onChange={(value) => this.setState({ passwordConfirm: value })}
                    />
                    <Infobox>
                        <p>{t('setPassword:anEncryptedCopy')}</p>
                    </Infobox>
                </section>
                <footer>
                    <Button to="/onboarding/account-name" className="inline" variant="secondary">
                        {t('back').toLowerCase()}
                    </Button>
                    <Button type="submit" className="large" variant="primary">
                        {t('next').toLowerCase()}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    firstAccount: !state.wallet.ready,
    onboarding: state.ui.onboarding,
});

const mapDispatchToProps = {
    setPassword,
    addAccountName,
    setAdditionalAccountInfo,
    setOnboardingSeed,
    setOnboardingName,
    generateAlert,
    setSeedIndex,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(AccountPassword));
