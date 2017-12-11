import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Template, { Content, Footer } from './Template';
import Button from '../UI/Button';

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
                        <p>{t('text1')}</p>
                        <p>{t('text2')}</p>
                        <p>
                            <strong>{t('reminder')}</strong>
                        </p>
                    </Content>
                    <Footer>
                        <Button to="/" variant="warning">
                            {t('button2')}
                        </Button>
                        <Button to="/wallet-setup" variant="success">
                            {t('button1')}
                        </Button>
                    </Footer>
                </Template>
            );
        }
    },
);
