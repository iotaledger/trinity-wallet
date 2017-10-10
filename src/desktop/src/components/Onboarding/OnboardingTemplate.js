import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Header from './Header';
import ButtonLink from '../UI/ButtonLink';
import { Route } from 'react-router-dom';
import SeedManualCopy from './SeedManualCopy';

class Template extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        match: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    componentWillMount() {
        this.navigateTo('/onboarding/seed/generate/save/manual');
    }

    navigateTo(url) {
        const { history } = this.props;
        history.push(url);
    }

    render() {
        const { t, match } = this.props;

        return (
            <form onSubmit={e => e.preventDefault()}>
                <Header headline={t('save your seed')} />
                <main>
                    <Route path={`${match.url}/manual`} component={SeedManualCopy} />
                </main>
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
