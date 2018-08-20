/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { MAX_ACC_LENGTH } from 'libs/crypto';

import { setOnboardingName } from 'actions/ui';
import { generateAlert } from 'actions/alerts';
import { setAdditionalAccountInfo } from 'actions/wallet';

import Button from 'ui/components/Button';
import Input from 'ui/components/input/Text';

/**
 * Onboarding, Set account name
 */
class AccountName extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        firstAccount: PropTypes.bool.isRequired,
        /** @ignore */
        accountInfo: PropTypes.object,
        /** @ignore */
        seedCount: PropTypes.number.isRequired,
        /** @ignore */
        setOnboardingName: PropTypes.func.isRequired,
        /** @ignore */
        setAdditionalAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        onboarding: PropTypes.object.isRequired,
        /** @ignore */
        history: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        name: this.props.onboarding.name.length ? this.props.onboarding.name : (this.props.seedCount === 0) ? this.props.t('mainWallet') : ''
    };

    /**
     * 1. Check for valid accout name
     * 2. In case onboarding seed does not exists, navigate to Seed generation view
     * 3. In case of additional seed, navigate to Login view
     * 4. In case of first seed, but seed already set, navigate to Account name view
     * @param {Event} event - Form submit event
     * @returns {undefined}
     */
    setName = (event) => {
        event.preventDefault();

        const {
            firstAccount,
            setOnboardingName,
            setAdditionalAccountInfo,
            accountInfo,
            history,
            generateAlert,
            t,
        } = this.props;

        const accountNames = Object.keys(accountInfo);

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

        setOnboardingName(this.state.name);

        if (!firstAccount) {
            setAdditionalAccountInfo({
                addingAdditionalAccount: true,
                additionalAccountName: this.state.name,
            });
        }

        if (Electron.getOnboardingGenerated()) {
            history.push('/onboarding/seed-save');
        } else {
            if (!firstAccount) {
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

        const { history } = this.props;

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
    firstAccount: !state.wallet.ready,
    seedCount: state.accounts.accountNames.length,
    accountInfo: state.accounts.accountInfo,
    onboarding: state.ui.onboarding,
});

const mapDispatchToProps = {
    generateAlert,
    setOnboardingName,
    setAdditionalAccountInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(AccountName));
