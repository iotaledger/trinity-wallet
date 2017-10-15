import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import BoxedSeed from './BoxedSeed';
import Header from './Header';
import Button from '../UI/Button';
import Steps from '../UI/Steps';

class SeedManualCopy extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
    };

    render() {
        const { t, seed } = this.props;

        return (
            <div>
                <Header title={t('title')} />
                <Steps />
                <main>
                    <div>
                        <BoxedSeed t={t} seed={seed} />
                    </div>
                </main>
                <footer>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button to="/" variant="warning">
                            {t('done')}
                        </Button>
                    </div>
                </footer>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state).seed,
});

export default translate('saveYourSeed2')(connect(mapStateToProps)(SeedManualCopy));
