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
 * Onboarding, set account name
 */
class AccountName extends React.PureComponent {
    static propTypes = {
        /** If first account is beeing created */
        firstAccount: PropTypes.bool.isRequired,
        /** Current accounts info */
        accountInfo: PropTypes.object,
        /** Current seed count */
        seedCount: PropTypes.number.isRequired,
        /** Set onboarding seed name */
        setOnboardingName: PropTypes.func.isRequired,
        /** Set additional account info
         * @param {Object} data - Additional account data
         */
        setAdditionalAccountInfo: PropTypes.func.isRequired,
        /** Onboarding set seed and name */
        onboarding: PropTypes.object.isRequired,
        /** Browser history object */
        history: PropTypes.object.isRequired,
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
        name: this.props.onboarding.name.length ? this.props.onboarding.name : this.getDefaultAccountName(),
    };

    getDefaultAccountName() {
        const { t, seedCount } = this.props;
        if (seedCount === 0) {
            return t('mainWallet');
        } else if (seedCount === 1) {
            return t('secondWallet');
        } else if (seedCount === 2) {
            return t('thirdWallet');
        } else if (seedCount === 3) {
            return t('fourthWallet');
        } else if (seedCount === 4) {
            return t('fifthWallet');
        } else if (seedCount === 5) {
            return t('sixthWallet');
        } else if (seedCount === 6) {
            return t('otherWallet');
        }
        return '';
    }

    setName = (e) => {
        e.preventDefault();
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
                t('addAdditionalSeed:accountNametooLong'),
                t('addAdditionalSeed:accountNametooLongExplanation', { maxLength: MAX_ACC_LENGTH }),
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
            history.push('/onboarding/login');
        } else {
            history.push('/onboarding/account-password');
        }
    };

    render() {
        const { t, onboarding } = this.props;
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
                    <Button
                        to={`/onboarding/seed-${onboarding.isGenerated ? 'save' : 'verify'}`}
                        className="square"
                        variant="dark"
                    >
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

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(translate()(AccountName));
