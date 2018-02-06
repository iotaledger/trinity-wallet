import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Button from 'ui/components/Button';
import Template, { Content, Footer } from './Template';
import LanguageSelect from '../UI/LanguageSelect';
import css from '../Layout/Onboarding.css';

class Welcome extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };

    // state = { modalOpen: false };

    render() {
        const { t } = this.props;
        return (
            <Template bodyClass={css.bodyHome}>
                <Content>
                    <LanguageSelect label={t('languageSetup:language')} />
                </Content>
                <Footer>
                    <Button to="/instructions" className="outline" variant="primary">
                        {t('global:next')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

export default translate('setLanguage')(Welcome);
