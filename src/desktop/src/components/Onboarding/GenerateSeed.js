import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { addAndSelectSeed, clearSeeds } from 'actions/seeds';
import { showError } from 'actions/notifications';
import { getSelectedSeed } from 'selectors/seeds';
import Template, { Content, Footer } from './Template';
import { isValidSeed } from '../../../../shared/libs/util';
import { createRandomSeed } from 'libs/seedUtil';
import Button from '../UI/Button';
import SeedGenerator from '../UI/SeedGenerator';
import css from '../Layout/Onboarding.css';

class GenerateSeed extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        addAndSelectSeed: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        seed: PropTypes.string,
        showError: PropTypes.func.isRequired,
    };

    state = {
        seed: this.props.seed,
    };

    generateNewSeed = () => {
        const newSeed = createRandomSeed();
        this.setState(() => ({
            seed: newSeed,
        }));
    };

    onUpdatedSeed = seed => {
        this.setState(() => ({
            seed,
        }));
    };

    onRequestNext = () => {
        const { addAndSelectSeed, history, showError } = this.props;
        const { seed } = this.state;

        if (!seed || !isValidSeed(seed)) {
            return showError({
                title: 'unknownError_title',
                text: 'unknownError_text',
                translate: true,
            });
        }
        clearSeeds(seed);
        addAndSelectSeed(seed);
        history.push('/seed/save');
    };

    render() {
        const { t } = this.props;
        const { seed } = this.state;
        return (
            <Template headline={t('title')}>
                <Content>
                    <Button type="button" onClick={this.generateNewSeed} variant="cta">
                        {t('button1')}
                    </Button>
                    <div className={css.seedGenerator}>
                        <SeedGenerator seed={seed} onUpdatedSeed={this.onUpdatedSeed} />
                    </div>
                    <p>{t('text1')}</p>
                </Content>
                <Footer>
                    <Button to="/wallet-setup" variant="warning">
                        {t('button3')}
                    </Button>
                    <Button onClick={this.onRequestNext} variant="success">
                        {t('button2')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state).seed,
});

const mapDispatchToProps = {
    addAndSelectSeed,
    clearSeeds,
    showError,
};

export default translate('newSeedSetup')(connect(mapStateToProps, mapDispatchToProps)(GenerateSeed));
