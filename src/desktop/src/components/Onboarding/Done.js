import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Template, { Main, Footer } from './Template';
import Button from '../UI/Button';

export default translate('onboardingComplete')(
    class Done extends React.PureComponent {
        static propTypes = {
            t: PropTypes.func.isRequired,
        };

        render() {
            const { t } = this.props;
            return (
                <Template headline={t('title')}>
                    <Main>
                        <p>{t('text1')}</p>
                    </Main>
                    <Footer>
                        <Button to="/" variant="success">
                            {t('button1')}
                        </Button>
                    </Footer>
                </Template>
            );
        }
    },
);
