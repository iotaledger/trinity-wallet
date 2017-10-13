import map from 'lodash/map';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import css from './BoxedSeed.css';
import ArrowWhiteIcon from '../../../../shared/images/arrow-white.png';
import ArrowBlackIcon from '../../../../shared/images/arrow-black.png';

class BoxedSeed extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string.isRequired,
        color: PropTypes.oneOf(['default', 'black']),
        size: PropTypes.oneOf(['small', 'large']),
    };

    static defaultProps = {
        color: 'default',
        size: 'large',
    };

    getCopyableSeed(columns) {
        return map(columns, (col, k) => (
            <div className={css.seedColumn} key={k}>
                {col}
            </div>
        ));
    }

    breakDownSeed(leftMinIdx, rightMinIdx, leftMaxIdx, rightMaxIdx) {
        const array = [];
        let k = 0;
        const { seed, size } = this.props;
        do {
            array.push(
                <span key={k} className={css[size]}>
                    {seed.substring(leftMinIdx, rightMinIdx)}
                </span>,
            );
            leftMinIdx = leftMinIdx + 12;
            rightMinIdx = rightMinIdx + 12;
            k += 1;
        } while (leftMinIdx <= leftMaxIdx && rightMinIdx <= rightMaxIdx);

        return array;
    }

    render() {
        const { color } = this.props;
        const firstCol = this.breakDownSeed(0, 3, 72, 75);
        const secondCol = this.breakDownSeed(3, 6, 75, 78);
        const thirdCol = this.breakDownSeed(6, 9, 78, 81);
        const fourthCol = this.breakDownSeed(9, 12, 69, 72);

        const copyableSeed = this.getCopyableSeed([firstCol, secondCol, thirdCol, fourthCol]);

        const isWhite = color === 'default';
        const arrowSrc = isWhite ? ArrowWhiteIcon : ArrowBlackIcon;
        return (
            <section className={`${css.boxedSeedContainer} ${css[color]}`}>
                <img src={arrowSrc} className={css.arrowRight} />
                <div className={css.copyableSeed}>{copyableSeed}</div>
            </section>
        );
    }
}

export default translate('seedManualCopy')(BoxedSeed);
