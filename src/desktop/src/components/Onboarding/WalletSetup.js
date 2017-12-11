import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Template, { Content, Footer } from './Template';
import Button from '../UI/Button';
import Infobox from '../UI/Infobox';

class WalletSetup extends React.PureComponent {
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
                    <Infobox>
                        <p>{t('seed_explanation1')}</p>
                        <p>{t('seed_explanation2')}</p>
                        <p>
                            <strong>{t('reminder')}</strong>
                        </p>
                    </Infobox>
                </Content>
                <Footer>
                    <Button to="/seed/generate" variant="warning">
                        {t('button2')}
                    </Button>
                    <Button to="/seed/enter" variant="success">
                        {t('button1')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

export default translate('welcome2')(WalletSetup);
