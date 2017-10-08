import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Header from './Header';
import ButtonLink from '../UI/ButtonLink';

import css from '../Layout/Onboarding.css';

class Template extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };

    state = {};

    render() {
        const { t } = this.props;
        return (
            <form onSubmit={e => e.preventDefault()}>
                <Header headline={t('title')} />
                <main>Content</main>
                <footer>
                    <ButtonLink to="/" variant="success">
                        {t('button3')}
                    </ButtonLink>
                </footer>
            </form>
        );
    }
}

export default translate('welcome1')(Template);
