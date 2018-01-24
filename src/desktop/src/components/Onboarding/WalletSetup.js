import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Template, { Content, Footer } from 'components/Onboarding/Template';
import Button from 'components/UI/Button';
import Infobox from 'components/UI/Infobox';

class WalletSetup extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t } = this.props;
        return (
            <Template>
                <Content>
                    <p>{t('walletSetup:okay')}</p>
                    <p>
                        <strong>{t('walletSetup:doYouAlreadyHaveASeed')}</strong>
                    </p>
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
                </Content>
                <Footer>
                    <Button to="/seed/generate" variant="secondary">
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
