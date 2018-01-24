import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Template, { Content, Footer } from './Template';
import Button from '../UI/Button';

export default translate('welcome1')(
    class Instruction extends React.PureComponent {
        static propTypes = {
            t: PropTypes.func.isRequired
        };

        render() {
            const { t } = this.props;
            return (
                <Template>
                    <Content>
                        <p>{t('welcome:thankYou')}</p>
                        <p>{t('welcome:weWillSpend')}</p>
                        <p>
                            <strong>{t('welcome:reminder')}</strong>
                        </p>
                    </Content>
                    <Footer>
                        <Button to="/" variant="secondary">
                            {t('global:back')}
                        </Button>
                        <Button to="/wallet-setup" variant="success">
                            {t('global:next')}
                        </Button>
                    </Footer>
                </Template>
            );
        }
    }
);
