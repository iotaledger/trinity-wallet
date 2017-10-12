import map from 'lodash/map';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

class BoxedSeed extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string.isRequired,
    };

    getCopyableSeed(columns) {
        return map(columns, (col, k) => (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} key={k}>
                {col}
            </div>
        ));
    }

    breakDownSeed(seed, leftMinIdx, rightMinIdx, leftMaxIdx, rightMaxIdx) {
        const array = [];
        let k = 0;
        do {
            array.push(<span key={k}>{seed.substring(leftMinIdx, rightMinIdx)}</span>);
            leftMinIdx = leftMinIdx + 12;
            rightMinIdx = rightMinIdx + 12;
            k += 1;
        } while (leftMinIdx <= leftMaxIdx && rightMinIdx <= rightMaxIdx);

        return array;
    }

    render() {
        const { seed } = this.props;
        const firstCol = this.breakDownSeed(seed, 0, 3, 72, 75);
        const secondCol = this.breakDownSeed(seed, 3, 6, 75, 78);
        const thirdCol = this.breakDownSeed(seed, 6, 9, 78, 81);
        const fourthCol = this.breakDownSeed(seed, 9, 12, 69, 72);

        const copyableSeed = this.getCopyableSeed([firstCol, secondCol, thirdCol, fourthCol]);
        return (
            <div
                style={{
                    border: '1px solid white',
                    borderRadius: '3px',
                    padding: '5px',
                    display: 'flex',
                }}
            >
                {copyableSeed}
            </div>
        );
    }
}

export default translate('seedManualCopy')(BoxedSeed);
