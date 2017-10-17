import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Template, { Main, Footer } from './Template';
import Button from '../UI/Button';
import LanguageSelect from '../UI/LanguageSelect';
import css from '../Layout/Onboarding.css';

export default translate('setLanguage')(
    class Welcome extends React.PureComponent {
        static propTypes = {
            t: PropTypes.func.isRequired,
        };

        render() {
            const { t } = this.props;
            return (
                <Template headline="Hello / Salut / Hola / Hallo">
                    <Main>
                        <div className={css.formGroup}>
                            <label>{t('dropdown_title')}</label>
                            <LanguageSelect />
                        </div>
                    </Main>
                    <Footer>
                        <Button to="/instructions" variant="success">
                            {t('button1')}
                        </Button>
                    </Footer>
                </Template>
            );
        }
    },
);
