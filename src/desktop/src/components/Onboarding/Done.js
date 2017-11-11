import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Template, { Content, Footer } from './Template';
import Button from '../UI/Button';
import css from '../Layout/Onboarding.css';

class Done extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t } = this.props;
        return (
            <Template bodyClass={css.bodyDone}>
                <Content>
                    <p>{t('text')}</p>
                </Content>
                <Footer>
                    <Button to="/" variant="success">
                        {t('button')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

export default translate('onboardingComplete')(Done);
