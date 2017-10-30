import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Template, { Main, Footer } from './Template';
import Button from '../UI/Button';
// import Modal from '../UI/Modal';
import LanguageSelect from '../UI/LanguageSelect';
import css from '../Layout/Onboarding.css';

class Welcome extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };

    state = { modalOpen: false };

    render() {
        const { t } = this.props;
        return (
            <Template bodyClass={css.bodyHome}>
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
}

export default translate('setLanguage')(Welcome);
