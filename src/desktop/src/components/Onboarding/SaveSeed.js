import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Header from './Header';
import Button from '../UI/Button';
// import LanguageSelect from 'components/UI/LanguageSelect';
// import css from '../Layout/Onboarding.css';

export default translate('saveYourSeed')(
    class Welcome extends React.PureComponent {
        static propTypes = {
            t: PropTypes.func.isRequired,
        };

        render() {
            const { t } = this.props;
            return (
                <div>
                    <Header headline={t('headline')} />
                    <main>
                        <p>{t('text1')}</p>
                        <p>
                            <Button variant="extra">{t('optionA')}</Button>
                        </p>
                        <p>
                            <Button variant="extra">{t('optionB')}</Button>
                        </p>
                        <p>
                            <Button variant="extra">{t('optionC')}</Button>
                        </p>
                    </main>
                    <footer>
                        <Button to="/onboarding/seed/generate" variant="warning">
                            {t('button2')}
                        </Button>
                        <Button to="/onboarding/seed/enter" variant="success">
                            {t('button1')}
                        </Button>
                    </footer>
                </div>
            );
        }
    },
);
