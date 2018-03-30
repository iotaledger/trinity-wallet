import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { isValidSeed } from 'libs/util';
import { createRandomSeed } from 'libs/crypto';

import { setNewSeed, clearNewSeed } from 'actions/seeds';
import { generateAlert } from 'actions/alerts';

import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';

import css from './index.css';

/**
 * Onboarding, Seed generation component
 */
class GenerateSeed extends React.PureComponent {
    static propTypes = {
        /** Accept current generated seed
         * @param {String} seed - New seed
         * @param {Boolean} isGenerated - Is the new seed generated
         */
        setNewSeed: PropTypes.func.isRequired,
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
        /** Clears new seed data from state */
        clearNewSeed: PropTypes.func.isRequired,
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
        const { setNewSeed, history, generateAlert, t } = this.props;
        const { seed } = this.state;

        if (!seed || !isValidSeed(seed)) {
            return generateAlert('error', t('seedReentry:incorrectSeed'), t('seedReentry:incorrectSeedExplanation'));
        }
        setNewSeed(seed, true);
        history.push('/onboarding/seed-save');
    };

    onRequestPrevious = () => {
        const { history, clearNewSeed } = this.props;

        clearNewSeed();
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
            <React.Fragment>
                <section>
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
                        {t('newSeedSetup:pressForNewSeed').toLowerCase()}
                    </Button>
                </section>
                <footer>
                    <Button onClick={this.onRequestPrevious} className="inline" variant="secondary">
                        {t('back').toLowerCase()}
                    </Button>
                    <Button onClick={this.onRequestNext} className="large" variant="primary">
                        {t('next').toLowerCase()}
                    </Button>
                </footer>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    newSeed: state.seeds.newSeed,
});

const mapDispatchToProps = {
    setNewSeed,
    clearNewSeed,
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(GenerateSeed));
