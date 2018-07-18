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
        scramble: Electron.getOnboardingSeed() ? new Array(81).fill(0) : createRandomSeed(),
        existingSeed: Electron.getOnboardingSeed(),
        clicks: [],
    };

    componentDidMount() {
        this.frame = 0;
        this.unscramble();
    }

    componentWillUnmount() {
        this.frame = -1;
    }

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

        this.generateNewSeed();

        history.push('/onboarding/account-name');
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

        this.frame = 0;

        this.setState({
            scramble: createRandomSeed(),
        });

        this.unscramble();
    };

    unscramble() {
        const { scramble } = this.state;

        if (this.frame < 0) {
            return;
        }

        const scrambleNew = [];
        let sum = -1;

        if (this.frame > 2) {
            sum = 0;

            for (let i = 0; i < scramble.length; i++) {
                sum += scramble[i];
                scrambleNew.push(Math.max(0, scramble[i] - 15));
            }

            this.setState({
                scramble: scrambleNew,
            });

            this.frame = 0;
        }

        this.frame++;

        if (sum !== 0) {
            requestAnimationFrame(this.unscramble.bind(this));
        }
    }

    render() {
        const { t } = this.props;
        const { seed, scramble, existingSeed, clicks } = this.state;

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
                                const offset = scramble[index];
                                const letter = byteToChar(byte + offset);
                                return (
                                    <button
                                        onClick={(e) => this.updateLetter(e, index)}
                                        key={`${index}${letter}`}
                                        value={letter}
                                        style={{ opacity: 1 - offset / 255 }}
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
