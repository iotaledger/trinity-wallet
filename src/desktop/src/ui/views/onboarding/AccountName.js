import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { setOnboardingName } from 'actions/ui';
import { generateAlert } from 'actions/alerts';

import Infobox from 'ui/components/Info';
import Button from 'ui/components/Button';
import Input from 'ui/components/input/Text';

/**
 * Onboarding, set account name
 */
class AccountName extends React.PureComponent {
    static propTypes = {
        /** Current accounts info */
        accountInfo: PropTypes.object,
        /** Current seed count */
        seedCount: PropTypes.number.isRequired,
        /** Set onboarding seed name */
        setOnboardingName: PropTypes.func.isRequired,
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
        const { setOnboardingName, accountInfo, history, generateAlert, t } = this.props;

        const accountNames = Object.keys(accountInfo);

        const name = this.state.name.replace(/^\s+|\s+$/g, '');

        if (!name.length) {
            generateAlert('error', t('addAdditionalSeed:noNickname'), t('addAdditionalSeed:noNicknameExplanation'));
            return;
        }

        if (accountNames.indexOf(name) > -1) {
            generateAlert('error', t('addAdditionalSeed:nameInUse'), t('addAdditionalSeed:nameInUseExplanation'));
            return;
        }

        setOnboardingName(this.state.name);
        history.push('/onboarding/account-password');
    };

    render() {
        const { t, onboarding } = this.props;
        const { name } = this.state;
        return (
            <form onSubmit={this.setName}>
                <section>
                    <Input
                        value={name}
                        focus
                        label={t('addAdditionalSeed:accountName')}
                        onChange={(value) => this.setState({ name: value })}
                    />
                    <Infobox>
                        <p>{t('setSeedName:canUseMultipleSeeds')}</p>
                    </Infobox>
                </section>
                <footer>
                    <Button
                        to={`/onboarding/seed-${onboarding.isGenerated ? 'save' : 'verify'}`}
                        className="inline"
                        variant="secondary"
                    >
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
    seedCount: state.accounts.accountNames.length,
    accountInfo: state.accounts.accountInfo,
    onboarding: state.ui.onboarding,
});

const mapDispatchToProps = {
    generateAlert,
    setOnboardingName,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(AccountName));
