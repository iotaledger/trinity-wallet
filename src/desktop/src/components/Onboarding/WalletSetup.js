import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Template, { Content, Footer } from 'components/Onboarding/Template';
import Button from 'ui/components/Button';
import Infobox from 'ui/components/Info';

class WalletSetup extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t } = this.props;
        return (
            <Template>
                <Content>
                    <h2>{t('walletSetup:okay')}</h2>
                    <p>{t('walletSetup:doYouAlreadyHaveASeed')}</p>
                    <Infobox>
                        <p>{t('walletSetup:seedExplanation')}</p>
                        <p>{t('walletSetup:explanation')}</p>
                        <p>
                            <strong>{t('walletSetup:keepSafe')}</strong>
                        </p>
                    </Infobox>
                </Content>
                <Footer>
                    <Button to="/seed/generate" className="outline" variant="highlight">
                        {t('global:no')}
                    </Button>
                    <Button to="/seed/enter" className="outline" variant="primary">
                        {t('global:yes')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

export default translate('welcome2')(WalletSetup);
