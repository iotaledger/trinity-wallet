import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { isValidSeed } from 'libs/util';
import { showError } from 'actions/notifications';
import { addAndSelectSeed, clearSeeds } from 'actions/seeds';
import { getSelectedSeed } from 'selectors/seeds';
import { MAX_SEED_LENGTH } from 'libs/util';
import Template, { Main, Footer } from './Template';
import Button from '../UI/Button';
import Infobox from '../UI/Infobox';
import SeedInput from 'components/UI/SeedInput';

import css from '../Layout/Onboarding.css';

class SeedEnter extends React.PureComponent {
    static propTypes = {
        addAndSelectSeed: PropTypes.func.isRequired,
        clearSeeds: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        selectedSeed: PropTypes.shape({
            seed: PropTypes.string,
        }).isRequired,
        showError: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
    };

    state = {
        seed: '',
        seedValid: this.props.selectedSeed.seed,
    };

    onChange = value => {
        this.setState(() => ({
            seed: value.replace(/[^a-zA-Z9]*/g, '').toUpperCase(),
        }));
    };

    getPaddedSeed = seed => {
        return `${seed}${'9'.repeat(MAX_SEED_LENGTH - seed.length < 0 ? 0 : MAX_SEED_LENGTH - seed.length)}`;
    };

    onSubmit = e => {
        e.preventDefault();
        const { addAndSelectSeed, clearSeeds, history, showError, t } = this.props;
        const { seed, seedValid } = this.state;
        if (seedValid && seed !== seedValid) {
            showError({ title: t('seedReentry:incorrectSeed'), text: t('seedReentry:incorrectSeedExplanation') });
            return;
        }
        if (!isValidSeed(seed)) {
            showError({
                title: t('seedReentry:incorrectSeed'),
                text: t('enterSeed:seedTooShort'),
            });
            return;
        }
        clearSeeds();
        addAndSelectSeed(seed);
        history.push('/seed/name');
    };

    render() {
        const { t } = this.props;
        const { seed = '', validSeed } = this.state;
        return (
            <Template type="form" onSubmit={this.onSubmit}>
                <Main>
                    <SeedInput
                        seed={seed}
                        onChange={this.onChange}
                        placeholder={t('global:seed')}
                        closeLabel={t('global:back')}
                    />
                    <Infobox>
                        <p>{t('seedReentry:thisIsACheck')}</p>
                        <p>{t('seedReentry:ifYouHaveNotSaved')}</p>
                    </Infobox>
                </Main>
                <Footer>
                    <Button to={validSeed ? '/seed/save/manual' : '/wallet-setup'} variant="warning">
                        {t('global:back')}
                    </Button>
                    <Button type="submit" variant="success">
                        {t('global:next')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

const mapStateToProps = state => ({
    selectedSeed: getSelectedSeed(state),
});

const mapDispatchToProps = {
    showError,
    addAndSelectSeed,
    clearSeeds,
};

export default translate('enterSeed')(connect(mapStateToProps, mapDispatchToProps)(SeedEnter));
