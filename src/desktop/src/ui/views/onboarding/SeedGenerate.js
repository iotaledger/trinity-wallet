import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { addAndSelectSeed, clearSeeds } from 'actions/seeds';
import { showError } from 'actions/notifications';
import { getSelectedSeed } from 'selectors/seeds';
import { isValidSeed, MAX_SEED_LENGTH } from 'libs/util';
import { createRandomSeed } from 'libs/crypto';
import Button from 'ui/components/Button';

import css from './seedGenerate.css';

/**
 * Onboarding, Seed generation component
 */
class GenerateSeed extends React.PureComponent {
    static propTypes = {
        /** Accept current generated seed */
        addAndSelectSeed: PropTypes.func.isRequired,
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Error modal helper
         * @param {Object} content - error screen content
         * @ignore
         */
        showError: PropTypes.func.isRequired,
        /** Clear seed data from state */
        clearSeeds: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        seed: null,
    };

    onUpdatedSeed = (seed) => {
        this.setState(() => ({
            seed,
        }));
    };

    onRequestNext = () => {
        const { addAndSelectSeed, history, showError } = this.props;
        const { seed } = this.state;

        if (!seed || !isValidSeed(seed)) {
            return showError({
                title: 'seedReentry:incorrectSeed',
                text: 'seedReentry:incorrectSeedExplanation',
                translate: true,
            });
        }
        clearSeeds(seed);
        addAndSelectSeed(seed);
        history.push('/onboarding/seed-save');
    };

    onRequestPrevious = () => {
        const { history, clearSeeds } = this.props;

        clearSeeds();
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

        const letters = seed ? seed.split('') : Array(MAX_SEED_LENGTH).fill('');

        return (
            <main>
                <section>
                    <Button type="button" onClick={this.generateNewSeed} variant="primary">
                        {t('newSeedSetup:pressForNewSeed')}
                    </Button>
                    <div className={classNames(css.wrapper, seed ? css.enabled : css.disabled)}>
                        {letters.map((letter, index) => {
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
                    <p>{this.state.seed ? t('newSeedSetup:individualLetters') : '\u00A0'}</p>
                </section>
                <footer>
                    <Button onClick={this.onRequestPrevious} className="outline" variant="highlight">
                        {t('global:back')}
                    </Button>
                    <Button onClick={this.onRequestNext} className="outline" disabled={!seed} variant="primary">
                        {t('global:next')}
                    </Button>
                </footer>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: getSelectedSeed(state).seed,
});

const mapDispatchToProps = {
    addAndSelectSeed,
    clearSeeds,
    showError,
};

export default translate('newSeedSetup')(connect(mapStateToProps, mapDispatchToProps)(GenerateSeed));
