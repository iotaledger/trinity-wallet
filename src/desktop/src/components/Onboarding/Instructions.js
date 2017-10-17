import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Header from './Header';
import Button from '../UI/Button';

// import css from '../Layout/Onboarding.css';

export default translate('welcome1')(
    class Instruction extends React.PureComponent {
        static propTypes = {
            t: PropTypes.func.isRequired,
        };

        render() {
            const { t } = this.props;
            return (
                <div>
                    <Header headline={t('title')} />
                    <main>
                        <p>{t('text1')}</p>
                        <p>{t('text2')}</p>
                        <p>
                            <strong>{t('reminder')}</strong>
                        </p>
                    </main>
                    <footer>
                        <Button to="/" variant="warning">
                            {t('button2')}
                        </Button>
                        <Button to="/lightserver" variant="success">
                            {t('button1')}
                        </Button>
                    </footer>
                </div>
            );
        }
    },
);
