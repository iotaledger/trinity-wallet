import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import Header from './Header';
import Button from '../UI/Button';

class SaveYourSeedOptions extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t } = this.props;

        return (
            <div>
                <Header headline={t('title')} />
                <p>{t('text1')}</p>
                <main>
                    <Button to="/onboarding/seed/save/manual" variant="extra">
                        {t('optionA')}
                    </Button>
                    <Button to="/onboarding/seed/save/paperwallet" variant="extra">
                        {t('optionB')}
                    </Button>
                    <Button to="/onboarding/seed/save/clipboard" variant="extra">
                        {t('optionC')}
                    </Button>
                </main>
                <footer>
                    <Button to="/" variant="warning">
                        {t('button2')}
                    </Button>
                    <Button to="/" variant="success">
                        {t('button1')}
                    </Button>
                </footer>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state).seed,
});

export default translate('saveYourSeed')(connect(mapStateToProps)(SaveYourSeedOptions));
