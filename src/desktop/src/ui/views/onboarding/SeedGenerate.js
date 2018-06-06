/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { translate, Interpolate } from 'react-i18next';
import { createRandomSeed, byteToChar } from 'libs/crypto';
import { capitalize } from 'libs/helpers';

import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';

import css from './index.scss';

/**
 * Onboarding, Seed generation component
 */
class GenerateSeed extends React.PureComponent {
    static propTypes = {
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        seed: Electron.getOnboardingSeed() || createRandomSeed(),
        existingSeed: Electron.getOnboardingSeed(),
        clicks: [],
    };

    onUpdatedSeed = (seed) => {
        this.setState(() => ({
            seed,
        }));
    };

    onRequestNext = () => {
        const { history } = this.props;
        const { seed } = this.state;

        Electron.setOnboardingSeed(seed, true);
        history.push('/onboarding/seed-save');
    };

    onRequestPrevious = () => {
        const { history } = this.props;

        Electron.setOnboardingSeed(null);
        history.push('/onboarding/seed-intro');
    };

    updateLetter = (e, position) => {
        const { seed, clicks } = this.state;

        if (e) {
            e.preventDefault();
        }

        const newClicks = clicks.indexOf(position) < 0 ? clicks.concat([position]) : clicks;

        const newSeed = seed.slice(0);
        newSeed[position] = createRandomSeed(1)[0];

        this.setState(() => ({
            seed: newSeed,
            clicks: newClicks,
        }));
    };

    generateNewSeed = () => {
        const newSeed = createRandomSeed();
        Electron.setOnboardingSeed(null);

        this.setState(() => ({
            seed: newSeed,
            existingSeed: false,
            clicks: [],
        }));
    };

    render() {
        const { t } = this.props;
        const { seed, existingSeed, clicks } = this.state;

        const clicksLeft = 10 - clicks.length;

        return (
            <form>
                <section className={css.wide}>
                    <h1>{t('newSeedSetup:generatedSeed')}</h1>
                    <Interpolate
                        i18nKey="newSeedSetup:individualLetterCount"
                        letterCount={
                            !existingSeed && clicksLeft > 0 ? (
                                <strong className={css.highlight}>{!existingSeed ? clicksLeft : 0}</strong>
                            ) : null
                        }
                    >
                        <p>
                            Press <strong /> individual letters to randomise them.
                        </p>
                    </Interpolate>
                    <div className={css.seed}>
                        <div>
                            {seed.map((byte, index) => {
                                const letter = byteToChar(byte);
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
                        disabled={!existingSeed && clicksLeft > 0}
                        onClick={this.onRequestNext}
                        className="square"
                        variant="primary"
                    >
                        {!existingSeed && clicksLeft > 0
                            ? `Randomise ${clicksLeft} characters to continue`
                            : t('continue')}
                    </Button>
                </footer>
            </form>
        );
    }
}

export default translate()(GenerateSeed);
