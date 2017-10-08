import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Header from './Header';
import ButtonLink from '../UI/ButtonLink';

class GenerateSeed extends React.PureComponent {
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
                </main>
                <footer>
                    <ButtonLink to="/onboarding/wallet" variant="warning">
                        {t('button3')}
                    </ButtonLink>
                    <ButtonLink to="/" variant="success">
                        {t('button2')}
                    </ButtonLink>
                </footer>
            </div>
        );
    }
}

export default translate('newSeedSetup')(GenerateSeed);
