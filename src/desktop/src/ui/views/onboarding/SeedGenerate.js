import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { setNewSeed, clearNewSeed } from 'actions/seeds';
import { showError } from 'actions/notifications';
import { isValidSeed, MAX_SEED_LENGTH } from 'libs/util';
import { createRandomSeed } from 'libs/crypto';
import Button from 'ui/components/Button';
import Infobox from 'ui/components/Info';

import css from './seedGenerate.css';

/**
 * Onboarding, Seed generation component
 */
class GenerateSeed extends React.PureComponent {
    static propTypes = {
        /** Accept current generated seed
         * @param {String} seed - New seed
         */
        setNewSeed: PropTypes.func.isRequired,
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Error modal helper
         * @param {Object} content - error screen content
         * @ignore
         */
        showError: PropTypes.func.isRequired,
        /** Clears new seed data from state */
        clearNewSeed: PropTypes.func.isRequired,
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
        const { setNewSeed, history, showError } = this.props;
        const { seed } = this.state;

        if (!seed || !isValidSeed(seed)) {
            return showError({
                title: 'seedReentry:incorrectSeed',
                text: 'seedReentry:incorrectSeedExplanation',
                translate: true,
            });
        }
        setNewSeed(seed);
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

        const letters = seed ? seed.split('') : Array(MAX_SEED_LENGTH).fill('');

        return (
            <React.Fragment>
                <section className={classNames(css.wrapper, seed ? css.enabled : css.disabled)}>
                    <Infobox>
                        <p>{t('walletSetup:seedExplanation')}</p>
                        <Trans i18nKey="walletSetup:explanation">
                            <p>
                                <span>You can use it to access your funds from</span>
                                <strong> any wallet</strong>
                                <span>, on</span>
                                <strong> any device</strong>
                                <span>. But if you lose your seed, you also lose your IOTA.</span>
                            </p>
                        </Trans>
                        <p>
                            <strong>{t('walletSetup:keepSafe')}</strong>
                        </p>
                    </Infobox>
                    <Button type="button" onClick={this.generateNewSeed} className="outline" variant="primary">
                        {t('newSeedSetup:pressForNewSeed')}
                    </Button>
                    <small>{this.state.seed ? t('newSeedSetup:individualLetters') : '\u00A0'}</small>
                    <div>
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
                </section>
                <footer>
                    <Button onClick={this.onRequestPrevious} className="outline" variant="highlight">
                        {t('global:back')}
                    </Button>
                    <Button onClick={this.onRequestNext} className="outline" disabled={!seed} variant="primary">
                        {t('global:next')}
                    </Button>
                </footer>
            </React.Fragment>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    setNewSeed,
    clearNewSeed,
    showError,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(GenerateSeed));
