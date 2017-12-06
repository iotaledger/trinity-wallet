import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import { MAX_SEED_LENGTH } from '../../../../shared/libs/util';
import Template, { Content, Footer } from './Template';
import BoxedSeed from '../UI/BoxedSeed';
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
            <Template>
                <Content>
                    <Steps currentStep="manual" />
                    <p>
                        {`Your seed is ${MAX_SEED_LENGTH} characters read from left to right. Write down your seed and checksum and triple
                        check they are correct.`}
                    </p>
                    <BoxedSeed t={t} seed={seed} />
                </Content>
                <Footer>
                    <Button to="/seed/save" variant="success">
                        {t('button')}
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
