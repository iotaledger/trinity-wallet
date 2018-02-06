import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Button from 'ui/components/Button';
import Template, { Content, Footer } from './Template';

export default translate('welcome1')(
    class Instruction extends React.PureComponent {
        static propTypes = {
            t: PropTypes.func.isRequired,
        };

        render() {
            const { t } = this.props;
            return (
                <Template>
                    <Content>
                        <h2>{t('welcome:thankYou')}</h2>
                        <p>{t('welcome:weWillSpend')}</p>
                        <p>
                            <strong>{t('welcome:reminder')}</strong>
                        </p>
                    </Content>
                    <Footer>
                        <Button to="/" className="outline" variant="highlight">
                            {t('global:back')}
                        </Button>
                        <Button to="/wallet-setup" className="outline" variant="primary">
                            {t('global:next')}
                        </Button>
                    </Footer>
                </Template>
            );
        }
    },
);
