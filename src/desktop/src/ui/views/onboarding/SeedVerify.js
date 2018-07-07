/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { MAX_SEED_LENGTH } from 'libs/iota/utils';
import { uniqueSeed } from 'libs/crypto';

import { generateAlert } from 'actions/alerts';

import Button from 'ui/components/Button';
import SeedInput from 'ui/components/input/Seed';

/**
 * Onboarding, Seed correct backup validation or existing seed input component
 */
class SeedVerify extends React.PureComponent {
    static propTypes = {
        /** Current wallet password */
        password: PropTypes.string.isRequired,
        /** Browser History object */
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
        seed: [],
        isGenerated: Electron.getOnboardingGenerated(),
    };

    componentDidMount() {
        if (Electron.getOnboardingSeed()) {
            Electron.clipboard(null);
            Electron.garbageCollect();
        }
    }

    onChange = (value) => {
        this.setState(() => ({
            seed: value,
        }));
    };

    setSeed = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const { history, password, generateAlert, t } = this.props;
        const { seed, isGenerated } = this.state;

        if (
            isGenerated &&
            (seed.length !== Electron.getOnboardingSeed().length ||
                !Electron.getOnboardingSeed().every((v, i) => v % 27 === seed[i] % 27))
        ) {
            generateAlert('error', t('seedReentry:incorrectSeed'), t('seedReentry:incorrectSeedExplanation'));
            return;
        }

        if (password.length) {
            const isUniqueSeed = await uniqueSeed(password, seed);
            if (!isUniqueSeed) {
                generateAlert('error', t('addAdditionalSeed:seedInUse'), t('addAdditionalSeed:seedInUseExplanation'));
                return;
            }
        }

        if (seed.length < MAX_SEED_LENGTH) {
            generateAlert(
                'error',
                t('enterSeed:seedTooShort'),
                t('enterSeed:seedTooShortExplanation', { maxLength: MAX_SEED_LENGTH, currentLength: seed.length }),
                999999,
            );
            return;
        }

        if (!isGenerated) {
            Electron.setOnboardingSeed(seed, false);
        }

        history.push('/onboarding/account-name');
    };

    render() {
        const { t } = this.props;
        const { seed, isGenerated } = this.state;

        return (
            <form>
                <section>
                    <h1>{t('seedReentry:enterYourSeed')}</h1>
                    {isGenerated ? (
                        <p>{t('seedReentry:enterSeedBelow')}</p>
                    ) : (
                        <p>
                            {t('enterSeed:seedExplanation', { maxLength: MAX_SEED_LENGTH })}{' '}
                            <strong>{t('enterSeed:neverShare')}</strong>
                        </p>
                    )}
                    <SeedInput seed={seed} focus onChange={this.onChange} label={t('seed')} closeLabel={t('back')} />
                </section>
                <footer>
                    <Button to={`/onboarding/seed-${isGenerated ? 'save' : 'intro'}`} className="square" variant="dark">
                        {t('goBackStep')}
                    </Button>
                    <Button onClick={this.setSeed} className="square" variant="primary">
                        {t('continue')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    password: state.wallet.password,
});

const mapDispatchToProps = {
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(SeedVerify));
