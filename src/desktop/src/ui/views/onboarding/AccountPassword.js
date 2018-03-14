import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { setSeeds } from 'actions/seeds';
import { generateAlert } from 'actions/alerts';
import { addAccountName } from 'actions/account';
import { setAdditionalAccountInfo, setSeedIndex } from 'actions/tempAccount';

import { isValidPassword } from 'libs/util';
import { setVault } from 'libs/crypto';

import Button from 'ui/components/Button';
import Infobox from 'ui/components/Info';
import PasswordInput from 'ui/components/input/Password';
import ModalPassword from 'ui/components/modal/Password';

/**
 * Onboarding, set account password
 */
class AccountPassword extends React.PureComponent {
    static propTypes = {
        /** Current state seed data */
        seeds: PropTypes.object.isRequired,
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
        /** Set seed state
         * @param {Array} seeds - Seeds list
         */
        setSeeds: PropTypes.func.isRequired,
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

    createAccount = (e) => {
        const {
            firstAccount,
            setSeeds,
            addAccountName,
            setAdditionalAccountInfo,
            setSeedIndex,
            history,
            seeds,
            generateAlert,
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

        const newSeeds = [].concat(seeds.seeds, seeds.newSeed);

        setSeeds(newSeeds);
        addAccountName(seeds.newName);

        setSeedIndex(seeds.seeds.length);

        setVault(firstAccount ? null : password, password, { seeds: newSeeds });

        if (!firstAccount) {
            setAdditionalAccountInfo({
                addingAdditionalAccount: true,
                additionalAccountName: seeds.newName,
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
                <div />
                <section>
                    <PasswordInput
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
                    <Button to="/onboarding/account-name" className="outline" variant="secondary">
                        {t('back')}
                    </Button>
                    <Button type="submit" className="outline" variant="primary">
                        {t('done')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    seeds: state.seeds,
    firstAccount: !state.tempAccount.ready,
});

const mapDispatchToProps = {
    setSeeds,
    addAccountName,
    setAdditionalAccountInfo,
    generateAlert,
    setSeedIndex,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(AccountPassword));
