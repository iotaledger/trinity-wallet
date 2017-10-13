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
        border: PropTypes.oneOf(['default', 'black']).isRequired,
        arrow: PropTypes.oneOf(['white', 'black']).isRequired,
    };

    static defaultProps = {
        border: 'default',
        arrow: 'white',
    };

    getCopyableSeed(columns) {
        return map(columns, (col, k) => (
            <div className={css.seedColumn} key={k}>
                {col}
            </div>
        ));
    }

    breakDownSeed(seed, leftMinIdx, rightMinIdx, leftMaxIdx, rightMaxIdx) {
        const array = [];
        let k = 0;
        do {
            array.push(
                <span key={k} className={css.seedPartials}>
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
        const { seed, border, arrow } = this.props;
        const firstCol = this.breakDownSeed(seed, 0, 3, 72, 75);
        const secondCol = this.breakDownSeed(seed, 3, 6, 75, 78);
        const thirdCol = this.breakDownSeed(seed, 6, 9, 78, 81);
        const fourthCol = this.breakDownSeed(seed, 9, 12, 69, 72);

        const copyableSeed = this.getCopyableSeed([firstCol, secondCol, thirdCol, fourthCol]);

        const isWhite = arrow === 'white';
        const arrowSrc = isWhite ? ArrowWhiteIcon : ArrowBlackIcon;
        return (
            <section className={`${css.boxedSeedContainer} ${css[border]}`}>
                <img src={arrowSrc} className={css.arrowRight} />
                <div className={css.copyableSeed}>{copyableSeed}</div>
            </section>
        );
    }
}

export default translate('seedManualCopy')(BoxedSeed);
