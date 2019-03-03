/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';

import { getAccountNamesFromState } from 'selectors/accounts';

import { MAX_ACC_LENGTH } from 'libs/crypto';
import SeedStore from 'libs/SeedStore';

import { generateAlert } from 'actions/alerts';
import { setAccountInfoDuringSetup } from 'actions/accounts';

import Button from 'ui/components/Button';
import Input from 'ui/components/input/Text';

/**
 * Onboarding, Set account name
 */
class AccountName extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        wallet: PropTypes.object.isRequired,
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        additionalAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        additionalAccountName: PropTypes.string.isRequired,
        /** @ignore */
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
        /** @ignore */
        history: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        name:
            this.props.additionalAccountName && this.props.additionalAccountName.length
                ? this.props.additionalAccountName
                : '',
    };

    /**
     * 1. Check for valid accout name
     * 2. In case onboarding seed does not exists, navigate to Seed generation view
     * 3. In case of additional seed, navigate to Login view
     * 4. In case of first seed, but seed already set, navigate to Account name view
     * @param {Event} event - Form submit event
     * @returns {undefined}
     */
    setName = async (event) => {
        event.preventDefault();

        const { wallet, accountNames, history, generateAlert, t } = this.props;

        const name = this.state.name.replace(/^\s+|\s+$/g, '');

        if (!name.length) {
            generateAlert('error', t('addAdditionalSeed:noNickname'), t('addAdditionalSeed:noNicknameExplanation'));
            return;
        }

        if (name.length > MAX_ACC_LENGTH) {
            generateAlert(
                'error',
                t('addAdditionalSeed:accountNameTooLong'),
                t('addAdditionalSeed:accountNameTooLongExplanation', { maxLength: MAX_ACC_LENGTH }),
            );
            return;
        }

        if (accountNames.map((accountName) => accountName.toLowerCase()).indexOf(name.toLowerCase()) > -1) {
            generateAlert('error', t('addAdditionalSeed:nameInUse'), t('addAdditionalSeed:nameInUseExplanation'));
            return;
        }

        this.props.setAccountInfoDuringSetup({
            name: this.state.name,
            completed: !Electron.getOnboardingGenerated() && accountNames.length > 0,
        });

        if (Electron.getOnboardingGenerated()) {
            history.push('/onboarding/seed-save');
        } else {
            if (accountNames.length > 0) {
                const seedStore = await new SeedStore.keychain(wallet.password);
                await seedStore.addAccount(this.state.name, Electron.getOnboardingSeed());

                history.push('/onboarding/login');
            } else {
                history.push('/onboarding/account-password');
            }
        }
    };

    stepBack = (e) => {
        if (e) {
            e.preventDefault();
        }

        const { history, additionalAccountMeta } = this.props;

        if (additionalAccountMeta.type === 'ledger') {
            return history.push('/onboarding/seed-ledger');
        }

        if (Electron.getOnboardingGenerated()) {
            history.push('/onboarding/seed-generate');
        } else {
            Electron.setOnboardingSeed(null);
            history.push('/onboarding/seed-verify');
        }
    };

    render() {
        const { t } = this.props;
        const { name } = this.state;
        return (
            <form onSubmit={this.setName}>
                <section>
                    <h1>{t('setSeedName:letsAddName')}</h1>
                    <p>{t('setSeedName:canUseMultipleSeeds')}</p>
                    <Input
                        value={name}
                        focus
                        label={t('addAdditionalSeed:accountName')}
                        onChange={(value) => this.setState({ name: value })}
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
    accountNames: getAccountNamesFromState(state),
    additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta,
    additionalAccountName: state.accounts.accountInfoDuringSetup.name,
    wallet: state.wallet,
});

const mapDispatchToProps = {
    generateAlert,
    setAccountInfoDuringSetup,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(AccountName));
