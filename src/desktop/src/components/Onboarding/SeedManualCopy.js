import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import Template, { Main, Footer } from './Template';
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
            <Template headline={t('title')}>
                <Main>
                    <Steps currentStep="manual" />
                    <p>
                        Your seed is 81 characters read from left to right. Write down your seed and checksum and triple
                        check they are correct.
                    </p>
                    <BoxedSeed t={t} seed={seed} />
                </Main>
                <Footer>
                    <Button to="/seed/save" variant="success">
                        {t('button1')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state).seed,
});

export default translate('saveYourSeed2')(connect(mapStateToProps)(SeedManualCopy));
