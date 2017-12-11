import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Template, { Main, Footer } from './Template';
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
                <Main>
                    <p>{t('walletSetup:okay')}</p>
                    <p>{t('walletSetup:doYouAlreadyHaveASeed')}</p>
                    <Infobox>
                        <p>{t('walletSetup:seedExplanation')}</p>
                        <p>
                            {t('walletSetup:explanation1')}
                            <strong>{t('walletSetup:explanation2')}</strong>
                            {t('walletSetup:explanation3')}
                            <strong>{t('walletSetup:explanation4')}</strong>
                            {t('walletSetup:explanation5')}
                        </p>
                        <p>
                            <strong>{t('walletSetup:keepSafe')}</strong>
                        </p>
                    </Infobox>
                </Main>
                <Footer>
                    <Button to="/seed/generate" variant="warning">
                        {t('global:no')}
                    </Button>
                    <Button to="/seed/enter" variant="success">
                        {t('global:yes')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

export default translate('welcome2')(WalletSetup);
