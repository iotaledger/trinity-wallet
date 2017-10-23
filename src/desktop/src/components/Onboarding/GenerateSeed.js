import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { addAndSelectSeed } from 'actions/seeds';
import { showError } from 'actions/notifications';
import { getSelectedSeed } from 'selectors/seeds';
import { isValidSeed } from '../../../../shared/libs/util';
import Template, { Main, Footer } from './Template';
import Button from '../UI/Button';
import SeedGenerator from '../UI/SeedGenerator';

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

        addAndSelectSeed({
            seed: seed,
        });

        history.push('/seed/save');
    };

    render() {
        const { t } = this.props;
        const { seed } = this.state;
        return (
            <Template headline={t('title')}>
                <Main>
                    <p>{t('text1')}</p>
                    <SeedGenerator seed={seed} onUpdatedSeed={this.onUpdatedSeed} />
                </Main>
                <Footer>
                    <Button to="/wallet" variant="warning">
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
    showError,
};

export default translate('newSeedSetup')(connect(mapStateToProps, mapDispatchToProps)(GenerateSeed));
