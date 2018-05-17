import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate, Interpolate } from 'react-i18next';
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
        clicks: [],
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

    updateLetter = (e, position) => {
        const { seed, clicks } = this.state;

        if (e) {
            e.preventDefault();
        }

        const newClicks = clicks.indexOf(position) < 0 ? clicks.concat([position]) : clicks;

        const newSeed = seed
            .split('')
            .map((letter, index) => (index === Number(position) ? createRandomSeed(1) : letter))
            .join('');

        this.setState(() => ({
            seed: newSeed,
            clicks: newClicks,
        }));
    };

    generateNewSeed = () => {
        const newSeed = createRandomSeed();

        this.props.setOnboardingSeed(null);

        this.setState(() => ({
            seed: newSeed,
            clicks: [],
        }));
    };

    render() {
        const { newSeed, t } = this.props;
        const { seed, clicks } = this.state;

        const clicksLeft = 10 - clicks.length;

        return (
            <form>
                <section className={css.wide}>
                    <h1>{t('newSeedSetup:generatedSeed')}</h1>
                    <Interpolate
                        i18nKey="newSeedSetup:individualLetterCount"
                        letterCount={
                            !newSeed && clicksLeft > 0 ? (
                                <strong className={css.highlight}>{!newSeed ? clicksLeft : 0}</strong>
                            ) : null
                        }
                    >
                        <p>
                            Press <strong /> individual letters to randomise them.
                        </p>
                    </Interpolate>
                    <div className={css.seed}>
                        <div>
                            {seed.split('').map((letter, index) => {
                                return (
                                    <button
                                        onClick={(e) => this.updateLetter(e, index)}
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
                    <Button onClick={this.onRequestPrevious} className="square" variant="dark">
                        {t('goBackStep')}
                    </Button>
                    <Button
                        disabled={!newSeed && clicksLeft > 0}
                        onClick={this.onRequestNext}
                        className="square"
                        variant="primary"
                    >
                        {!newSeed && clicksLeft > 0 ? `Randomise ${clicksLeft} characters to continue` : t('continue')}
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
