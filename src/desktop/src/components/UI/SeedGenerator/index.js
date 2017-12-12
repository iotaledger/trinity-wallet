import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { createRandomSeed } from 'libs/seedUtil';
import { MAX_SEED_LENGTH } from 'libs/util';

import css from './SeedGenerator.css';

export default class SeedGenerator extends React.PureComponent {
    static propTypes = {
        seed: PropTypes.string,
        onUpdatedSeed: PropTypes.func,
    };

    state = {
        seed: this.props.seed || null,
        updateCounter: {},
    };

    componentDidMount() {
        this.onUpdatedSeed(this.state.seed);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.seed !== this.props.seed) {
            this.setState(() => ({
                seed: nextProps.seed,
            }));
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.seed !== this.state.seed) {
            return this.onUpdatedSeed(this.state.seed, prevState.seed);
        }
    }

    onUpdatedSeed = (seed = this.state.seed, previous = null) => {
        if (typeof this.props.onUpdatedSeed === 'function') {
            const differenceCounter = (seed || '').split('').reduce((acc, v, i) => {
                return v === (previous || '')[i] ? acc : acc + 1;
            }, 0);
            // we got a completely new seed, so reset the updateCounter for letters
            if (differenceCounter > 1) {
                this.setState(() => ({
                    updateCounter: {},
                }));
            }
            return this.props.onUpdatedSeed(seed, previous);
        }
    };

    onLetterPressed = e => {
        e.preventDefault();
        const { target: { dataset } } = e;
        this.changeRandomLetterAtPosition(Number(dataset.index));
    };

    changeRandomLetterAtPosition = position => {
        this.setState(state => {
            const seed = state.seed
                .split('')
                .map((letter, index) => (index === Number(position) ? createRandomSeed(1) : letter))
                .join('');

            const updateCounter = {
                ...state.updateCounter,
                [position]: (state.updateCounter[position] || 0) + 1,
            };

            return {
                seed,
                updateCounter,
            };
        });
    };

    render() {
        const { seed, updateCounter } = this.state;
        const dummyArray = new Array(MAX_SEED_LENGTH).fill('');
        return (
            <div className={classNames(css.wrapper, seed ? css.enabled : css.disabled)}>
                {seed
                    ? seed.split('').map((letter, index) => {
                          return (
                              <Letter
                                  index={index}
                                  onClick={this.onLetterPressed}
                                  key={`${index}${letter}`}
                                  value={letter}
                                  updated={updateCounter[index] || 0}
                              />
                          );
                      })
                    : Array(MAX_SEED_LENGTH)
                          .fill('')
                          .map((item, key) => <Letter key={key} updated={0} />)}
            </div>
        );
    }
}
