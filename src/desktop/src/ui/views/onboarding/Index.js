import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';

import Logo from 'ui/components/Logo';
import Icon from 'ui/components/Icon';

import Welcome from 'ui/views/onboarding/Welcome';
import Login from 'ui/views/onboarding/Login';
import SeedIntro from 'ui/views/onboarding/SeedIntro';
import GenerateSeed from 'ui/views/onboarding/SeedGenerate';
import SaveYourSeedOptions from 'ui/views/onboarding/SeedSave';
import SeedEnter from 'ui/views/onboarding/SeedVerify';
import SeedName from 'ui/views/onboarding/AccountName';
import SecurityEnter from 'ui/views/onboarding/AccountPassword';
import Done from 'ui/views/onboarding/Done';

import css from './index.css';

/**
 * Onboarding main router wrapper component
 */
class Onboarding extends React.PureComponent {
    static propTypes = {
        /** Is wallet in authorised state */
        isAuthorised: PropTypes.bool,
        /** Onboarding completion status */
        complete: PropTypes.bool,
        /** Browser location */
        location: PropTypes.object,
        /** Browser history obejct */
        history: PropTypes.object,
    };

    render() {
        const { location, complete, isAuthorised, history } = this.props;

        const indexComponent = complete ? Login : Welcome;

        return (
            <main className={css.onboarding}>
                <header>
                    {!isAuthorised ? (
                        <Logo size={64} />
                    ) : (
                        <a onClick={() => history.push('/wallet/')}>
                            <Icon icon="cross" size={40} />
                        </a>
                    )}
                </header>
                <Switch location={location}>
                    <Route path="/onboarding/seed-intro" component={SeedIntro} />
                    <Route path="/onboarding/seed-generate" component={GenerateSeed} />
                    <Route path="/onboarding/seed-save" component={SaveYourSeedOptions} />
                    <Route path="/onboarding/seed-verify" component={SeedEnter} />
                    <Route path="/onboarding/account-name" component={SeedName} />
                    <Route path="/onboarding/account-password" component={SecurityEnter} />
                    <Route path="/onboarding/done" component={Done} />
                    <Route path="/" component={indexComponent} />
                </Switch>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    complete: state.account.onboardingComplete,
    isAuthorised: state.tempAccount.ready,
});

export default withRouter(connect(mapStateToProps)(Onboarding));
