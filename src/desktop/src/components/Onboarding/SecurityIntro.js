import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Template, { Main, Footer } from './Template';
import Button from '../UI/Button';
import Infobox from '../UI/Infobox';

export default translate('securityIntro')(
    class SecurityEntry extends React.PureComponent {
        static propTypes = {
            t: PropTypes.func.isRequired,
        };

        render() {
            const { t } = this.props;
            return (
                <Template headline={t('title')}>
                    <Main>
                        <p>{t('text1')}</p>
                        <Infobox>
                            <p>{t('explanation1')}</p>
                            <p>{t('explanation2')}</p>
                        </Infobox>
                    </Main>
                    <Footer>
                        <Button to="/seed/enter" variant="warning">
                            {t('button2')}
                        </Button>
                        <Button to="/security/set" variant="success">
                            {t('button1')}
                        </Button>
                    </Footer>
                </Template>
            );
        }
    },
);
