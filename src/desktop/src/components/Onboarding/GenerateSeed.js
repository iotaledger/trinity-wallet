import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { addAndSelectSeed, clearSeeds } from 'actions/seeds';
import { showError } from 'actions/notifications';
import { getSelectedSeed } from 'selectors/seeds';
import { isValidSeed } from 'libs/util';
import { createRandomSeed } from 'libs/seedUtil';
import Button from 'ui/components/Button';
import Template, { Content, Footer } from './Template';
import SeedGenerator from '../UI/SeedGenerator';

class GenerateSeed extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        addAndSelectSeed: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        showError: PropTypes.func.isRequired,
        clearSeeds: PropTypes.func.isRequired,
    };

    state = {
        seed: null,
    };

    onUpdatedSeed = (seed) => {
        this.setState(() => ({
            seed,
        }));
    };

    onRequestNext = () => {
        const { addAndSelectSeed, history, showError } = this.props;
        const { seed } = this.state;

        if (!seed || !isValidSeed(seed)) {
            return showError({
                title: 'seedReentry:incorrectSeed',
                text: 'seedReentry:incorrectSeedExplanation',
                translate: true,
            });
        }
        clearSeeds(seed);
        addAndSelectSeed(seed);
        history.push('/seed/save/manual');
    };

    onRequestPrevious = () => {
        const { history, clearSeeds } = this.props;

        clearSeeds();
        history.push('/wallet-setup');
    };

    generateNewSeed = () => {
        const newSeed = createRandomSeed();
        this.setState(() => ({
            seed: newSeed,
        }));
    };

    render() {
        const { t } = this.props;
        const { seed } = this.state;

        return (
            <Template>
                <Content>
                    <Button type="button" onClick={this.generateNewSeed} variant="primary">
                        {t('newSeedSetup:pressForNewSeed')}
                    </Button>
                    <SeedGenerator seed={seed} onUpdatedSeed={this.onUpdatedSeed} />
                    <p>{this.state.seed ? t('newSeedSetup:individualLetters') : '\u00A0'}</p>
                </Content>
                <Footer>
                    <Button onClick={this.onRequestPrevious} className="outline" variant="highlight">
                        {t('global:back')}
                    </Button>
                    <Button onClick={this.onRequestNext} className="outline" disabled={!seed} variant="primary">
                        {t('global:next')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: getSelectedSeed(state).seed,
});

const mapDispatchToProps = {
    addAndSelectSeed,
    clearSeeds,
    showError,
};

export default translate('newSeedSetup')(connect(mapStateToProps, mapDispatchToProps)(GenerateSeed));
