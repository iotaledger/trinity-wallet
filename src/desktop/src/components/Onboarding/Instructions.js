import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Header from './Header';
import ButtonLink from '../UI/ButtonLink';

// import css from '../Layout/Onboarding.css';

export default translate('welcome1')(
    class Instruction extends React.PureComponent {
        static propTypes = {
            t: PropTypes.func.isRequired
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
                        <ButtonLink to="/" variant="warning">
                            {t('button2')}
                        </ButtonLink>
                        <ButtonLink to="/onboarding/lightserver" variant="success">
                            {t('button1')}
                        </ButtonLink>
                    </footer>
                </div>
            );
        }
    }
);
