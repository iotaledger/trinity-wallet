import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withI18n } from 'react-i18next';

import { byteToChar } from 'libs/iota/converter';

import Button from 'ui/components/Button';
import Tooltip from 'ui/components/Tooltip';
import Icon from 'ui/components/Icon';

import css from './index.scss';

/**
 * Onboarding, Seed write down step
 */
class SeedSave extends PureComponent {
    static propTypes = {
        /** @ignore */
        seed: PropTypes.array.isRequired,
        /** @ignore */
        checksum: PropTypes.string.isRequired,
        /** @ignore */
        onClose: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        writeIndex: 1,
    };

    render() {
        const { seed, checksum, onClose, t } = this.props;
        const { writeIndex } = this.state;

        return (
            <React.Fragment>
                <section>
                    <h1>{t('saveYourSeed:letsWriteDownYourSeed')}</h1>
                    <p>{t('saveYourSeed:youCanHighlightCharacters')}</p>
                    <div className={classNames(css.seed, css.narrow)}>
                        <div>
                            {seed &&
                                seed.map((byte, index) => {
                                    if (index % 3 !== 0) {
                                        return null;
                                    }
                                    const letter = `${byteToChar(byte)}${byteToChar(seed[index + 1])}${byteToChar(
                                        seed[index + 2],
                                    )}`;

                                    return (
                                        <span
                                            className={writeIndex !== Math.floor(index / 9) + 1 ? css.disabled : null}
                                            key={`${index}${letter}`}
                                        >
                                            {index % 9 === 0 ? <em>{index / 9 + 1}</em> : null}
                                            {letter}
                                        </span>
                                    );
                                })}
                        </div>
                        <div>
                            <Tooltip
                                title={t('saveYourSeed:whatIsAChecksum')}
                                tip={t('saveYourSeed:checksumExplanation')}
                            />{' '}
                            {t('checksum')}: <strong>{checksum}</strong>
                        </div>
                        <nav className={css.arrows}>
                            <a
                                onClick={() => this.setState({ writeIndex: writeIndex - 1 })}
                                className={writeIndex === 1 ? css.disabled : null}
                            >
                                <Icon icon="arrowUp" size={21} />
                            </a>
                            <a
                                onClick={() => this.setState({ writeIndex: writeIndex + 1 })}
                                className={writeIndex === 9 ? css.disabled : null}
                            >
                                <Icon icon="arrowDown" size={24} />
                            </a>
                        </nav>
                    </div>
                </section>
                <footer>
                    <Button onClick={() => window.print()} className="square" variant="dark">
                        {t('saveYourSeed:printBlankWallet')}
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            onClose();
                        }}
                        variant="primary"
                        className="square"
                    >
                        {t('back')}
                    </Button>
                </footer>
            </React.Fragment>
        );
    }
}

export default withI18n()(SeedSave);
