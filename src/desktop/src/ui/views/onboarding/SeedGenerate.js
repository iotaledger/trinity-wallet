import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { isValidSeed } from 'libs/iota/utils';
import { createRandomSeed } from 'libs/crypto';
import { capitalize } from 'libs/helpers';

import { setOnboardingSeed } from 'actions/ui';
import { generateAlert } from 'actions/alerts';

import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';

import css from './index.scss';

/**
 * Onboarding, Seed generation component
 */
class GenerateSeed extends React.PureComponent {
    static propTypes = {
        /** Set onboarding seed state
         * @param {String} seed - New seed
         * @param {Boolean} isGenerated - Is the new seed generated
         */
        setOnboardingSeed: PropTypes.func.isRequired,
        /** Current new seed */
        newSeed: PropTypes.string,
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
        seed: this.props.newSeed || createRandomSeed(),
    };

    onUpdatedSeed = (seed) => {
        this.setState(() => ({
            seed,
        }));
    };

    onRequestNext = () => {
        const { setOnboardingSeed, history, generateAlert, t } = this.props;
        const { seed } = this.state;

        if (!seed || !isValidSeed(seed)) {
            return generateAlert('error', t('seedReentry:incorrectSeed'), t('seedReentry:incorrectSeedExplanation'));
        }
        setOnboardingSeed(seed, true);
        history.push('/onboarding/seed-save');
    };

    onRequestPrevious = () => {
        const { history, setOnboardingSeed } = this.props;

        setOnboardingSeed(null);
        history.push('/onboarding/seed-intro');
    };

    updateLetter = (position) => {
        const { seed } = this.state;

        const newSeed = seed
            .split('')
            .map((letter, index) => (index === Number(position) ? createRandomSeed(1) : letter))
            .join('');

        this.setState(() => ({
            seed: newSeed,
        }));
    };

    generateNewSeed = () => {
        const newSeed = createRandomSeed();
        this.setState(() => ({
            seed: newSeed,
        }));
    };

    render() {
        const { t } = this.props;
        const { seed } = this.state;

        return (
            <form>
                <section className={css.wide}>
                    <h1>{t('newSeedSetup:generatedSeed')}</h1>
                    <p>{t('newSeedSetup:individualLetters')}</p>
                    <div className={css.seed}>
                        <div>
                            {seed.split('').map((letter, index) => {
                                return (
                                    <button
                                        onClick={() => this.updateLetter(index)}
                                        key={`${index}${letter}`}
                                        value={letter}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <Button type="button" onClick={this.generateNewSeed} className="icon">
                        <Icon icon="sync" size={32} />
                        {capitalize(t('newSeedSetup:pressForNewSeed'))}
                    </Button>
                </section>
                <footer>
                    <Button onClick={this.onRequestPrevious} className="square" variant="back">
                        {t('goBackStep')}
                    </Button>
                    <Button onClick={this.onRequestNext} className="square" variant="primary">
                        {t('continue')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    newSeed: state.ui.onboarding.seed,
});

const mapDispatchToProps = {
    setOnboardingSeed,
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(GenerateSeed));
