import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import css from './BoxedSeed.css';

class BoxedSeed extends PureComponent {
    static propTypes = {
        seed: PropTypes.string.isRequired,
        border: PropTypes.oneOf(['default', 'black']).isRequired,
    };

    static defaultProps = {
        border: 'default',
    };

    getCopyableSeed = (seed = this.props.seed) => {
        const seedArray = [];

        for (let i = 0; i < seed.length; i++) {
            let j;
            let threeLetters = '';
            for (j = 0; j < 3; j++) {
                threeLetters += seed[i + j] || '';
            }
            i = i + (j - 1);
            seedArray.push(threeLetters);
        }

        return seedArray.map((fragment, i) => <span key={`${i}${fragment}`}>{fragment}</span>);
    };

    render() {
        const { seed, border } = this.props;

        const copyableSeed = this.getCopyableSeed(seed);

        return (
            <section className={`${css.boxedSeedContainer} ${css[border]}`}>
                <div className={css.copyableSeed}>{copyableSeed}</div>
            </section>
        );
    }
}

export default BoxedSeed;
