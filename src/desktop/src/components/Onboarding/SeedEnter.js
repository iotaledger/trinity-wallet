import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { isValidSeed, MAX_SEED_LENGTH } from 'libs/util';
import { showError } from 'actions/notifications';
import { addAndSelectSeed, clearSeeds } from 'actions/seeds';
import { getSelectedSeed } from 'selectors/seeds';
import Template, { Content, Footer } from 'components/Onboarding/Template';
import Button from 'ui/components/Button';
import Infobox from 'ui/components/Info';
import SeedInput from 'components/UI/input/Seed';

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

    onChange = (value) => {
        this.setState(() => ({
            seed: value.replace(/[^a-zA-Z9]*/g, '').toUpperCase(),
        }));
    };

    onSubmit = (e) => {
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

    getPaddedSeed = (seed) => {
        return `${seed}${'9'.repeat(MAX_SEED_LENGTH - seed.length < 0 ? 0 : MAX_SEED_LENGTH - seed.length)}`;
    };

    getPaddedSeed = (seed) => {
        return `${seed}${'9'.repeat(MAX_SEED_LENGTH - seed.length < 0 ? 0 : MAX_SEED_LENGTH - seed.length)}`;
    };

    openScanner = () => {
        this.setState(() => ({
            showScanner: true,
        }));
    };

    closeScanner = () => {
        this.setState(() => ({
            showScanner: false,
        }));
    };

    render() {
        const { t } = this.props;
        const { seed = '', seedValid } = this.state;
        return (
            <Template type="form" onSubmit={this.onSubmit}>
                <Content>
                    <SeedInput
                        seed={seed}
                        onChange={this.onChange}
                        label={t('global:seed')}
                        closeLabel={t('global:back')}
                    />
                    <Infobox>
                        <p>{t('seedReentry:thisIsACheck')}</p>
                        <p>{t('seedReentry:ifYouHaveNotSaved')}</p>
                    </Infobox>
                </Content>
                <Footer>
                    <Button
                        to={seedValid ? '/seed/save/manual' : '/wallet-setup'}
                        className="outline"
                        variant="highlight"
                    >
                        {t('global:back')}
                    </Button>
                    <Button type="submit" className="outline" variant="primary">
                        {t('global:next')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

const mapStateToProps = (state) => ({
    selectedSeed: getSelectedSeed(state),
});

const mapDispatchToProps = {
    showError,
    addAndSelectSeed,
    clearSeeds,
};

export default translate('enterSeed')(connect(mapStateToProps, mapDispatchToProps)(SeedEnter));
