import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Header from './Header';
import Button from '../UI/Button';
import css from './SaveYourSeedOptions.css';

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
                <main className={css.main}>
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

export default translate('saveYourSeed')(SaveYourSeedOptions);
