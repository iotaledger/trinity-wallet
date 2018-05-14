/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { VALID_SEED_REGEX, MAX_SEED_LENGTH } from 'libs/iota/utils';
import { getVault } from 'libs/crypto';

import { generateAlert } from 'actions/alerts';
import { setOnboardingSeed } from 'actions/ui';

import Button from 'ui/components/Button';
import SeedInput from 'ui/components/input/Seed';

/**
 * Onboarding, Seed correct backup validation or existing seed input component
 */
class SeedVerify extends React.PureComponent {
    static propTypes = {
        /** Current wallet password */
        password: PropTypes.string.isRequired,
        /** Current onboarding seed, generation state */
        onboarding: PropTypes.object.isRequired,
        /** Set onboarding seed state
         * @param {String} seed - New seed
         * @param {Boolean} isGenerated - Is the new seed generated
         */
        setOnboardingSeed: PropTypes.func.isRequired,
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
        seed: '',
    };

    componentDidMount() {
        if (this.props.onboarding.isGenerated) {
            Electron.clipboard('');
        }
    }

    onChange = (value) => {
        this.setState(() => ({
            seed: value.replace(/[^a-zA-Z9]*/g, '').toUpperCase(),
        }));
    };

    setSeed = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const { history, password, setOnboardingSeed, generateAlert, onboarding, t } = this.props;
        const { seed } = this.state;

        if (onboarding.isGenerated && seed !== onboarding.seed) {
            generateAlert('error', t('seedReentry:incorrectSeed'), t('seedReentry:incorrectSeedExplanation'));
            return;
        }

        if (password.length) {
            const vault = await getVault(password);
            if (vault.seeds.indexOf(seed) > -1) {
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
        } else if (!seed.match(VALID_SEED_REGEX)) {
            generateAlert('error', t('enterSeed:invalidCharacters'), t('enterSeed:invalidCharactersExplanation'));
            return;
        }

        if (!onboarding.isGenerated) {
            setOnboardingSeed(seed, false);
        }

        history.push('/onboarding/account-name');
    };

    render() {
        const { onboarding, t } = this.props;
        const { seed = '' } = this.state;
        return (
            <form onSubmit={(e) => this.setSeed(e)}>
                <section>
                    <h1>{t('seedReentry:enterYourSeed')}</h1>
                    {onboarding.isGenerated ? (
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
                    <Button
                        to={`/onboarding/seed-${onboarding.isGenerated ? 'save' : 'intro'}`}
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
    onboarding: state.ui.onboarding,
    password: state.wallet.password,
});

const mapDispatchToProps = {
    generateAlert,
    setOnboardingSeed,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(SeedVerify));
