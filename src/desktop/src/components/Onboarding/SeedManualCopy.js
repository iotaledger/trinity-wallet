import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import { MAX_SEED_LENGTH } from 'libs/util';
import BoxedSeed from '../UI/BoxedSeed';

class SeedManualCopy extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
    };

    render() {
        const { t, seed } = this.props;

        return (
            <div>
                <p>
                    {`Your seed is ${MAX_SEED_LENGTH} characters read from left to right. Write down your seed and checksum and triple
                        check they are correct.`}
                </p>
                <BoxedSeed t={t} seed={seed} />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state).seed,
});

export default translate('saveYourSeed2')(connect(mapStateToProps)(SeedManualCopy));
