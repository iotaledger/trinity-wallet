import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { clearSeeds } from 'actions/seeds';
import { getSelectedSeed } from 'selectors/seeds';
import Template, { Main, Footer } from './Template';
import Button from '../UI/Button';
import css from './SaveYourSeedOptions.css';

class SaveYourSeedOptions extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t } = this.props;

        return (
            <Template>
                <Main className={css.main}>
                    <p>{t('text1')}</p>
                    <p>
                        <Button to="/seed/save/manual" variant="extra">
                            {t('optionA')}
                        </Button>
                    </p>
                    <p>
                        <Button to="/seed/save/paperwallet" variant="extra">
                            {t('optionB')}
                        </Button>
                    </p>
                    <p>
                        <Button to="/seed/save/clipboard" variant="extra">
                            {t('optionC')}
                        </Button>
                    </p>
                </Main>
                <Footer>
                    <Button to="/seed/generate" variant="warning">
                        {t('button2')}
                    </Button>
                    <Button to="/seed/enter" onClick={() => console.log('CLEAR SEEDS HERE')} variant="success">
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

const mapDispatchToProps = {
    clearSeeds,
};

export default translate('saveYourSeed')(connect(mapStateToProps, mapDispatchToProps)(SaveYourSeedOptions));
