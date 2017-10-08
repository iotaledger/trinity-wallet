import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Header from './Header';
import ButtonLink from '../UI/ButtonLink';
import Infobox from '../UI/Infobox';

class WalletSetup extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired
    };

    render() {
        const { t } = this.props;
        return (
            <div>
                <Header headline={t('title')} />
                <main>
                    <p>{t('text1')}</p>
                    <p>{t('text2')}</p>
                    <Infobox>
                        <p>{t('seed_explanation1')}</p>
                        <p>{t('seed_explanation2')}</p>
                        <p>
                            <strong>{t('reminder')}</strong>
                        </p>
                    </Infobox>
                </main>
                <footer>
                    <p>
                        <ButtonLink to="/onboarding/seed/enter" variant="success">
                            {t('button1')}
                        </ButtonLink>
                    </p>
                    <p>
                        <ButtonLink to="/onboarding/seed/generate" variant="warning">
                            {t('button2')}
                        </ButtonLink>
                    </p>
                </footer>
            </div>
        );
    }
}

export default translate('welcome2')(WalletSetup);
