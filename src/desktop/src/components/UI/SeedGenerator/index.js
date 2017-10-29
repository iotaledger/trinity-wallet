import React from 'react';
import PropTypes from 'prop-types';
import Letter from './Letter';
import { createRandomSeed } from '../../../libs/util';

import css from './SeedGenerator.css';

export default class SeedGenerator extends React.PureComponent {
    static propTypes = {
        seed: PropTypes.string,
        onUpdatedSeed: PropTypes.func,
    };

    state = {
        seed: this.props.seed || createRandomSeed(),
        updateCounter: {},
    };

    componentDidMount() {
        this.onUpdatedSeed(this.state.seed);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.seed !== this.props.seed) {
            console.log('CWRP:', nextProps.seed);
            this.setState(() => ({
                seed: nextProps.seed,
            }));
            // return this.onUpdatedSeed(nextProps.seed, this.state.seed);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        console.log('CDU', prevState, this.state);
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

    onLetterPressed = e => {
        e.preventDefault();
        const { target: { dataset } } = e;
        this.changeRandomLetterAtPosition(Number(dataset.index));
    };

    render() {
        const { seed, updateCounter } = this.state;
        return (
            <div className={css.wrapper}>
                {seed.split('').map((letter, index) => {
                    return (
                        <Letter
                            index={index}
                            onClick={this.onLetterPressed}
                            key={`${index}${letter}`}
                            value={letter}
                            updated={updateCounter[index] || 0}
                        />
                    );
                })}
            </div>
        );
    }
}
