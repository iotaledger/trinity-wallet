import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Logo from 'ui/components/Logo';

import Welcome from 'ui/views/onboarding/Welcome';
import Login from 'ui/views/onboarding/Login';
import Instructions from 'ui/views/onboarding/Instructions';
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
        /** Onboarding completion status */
        complete: PropTypes.bool,
        /** Browser location */
        location: PropTypes.object,
    };

    render() {
        const { location, complete } = this.props;

        const indexComponent = complete ? Login : Welcome;

        return (
            <main className={css.onboarding}>
                <header>
                    <Logo size={64} />
                </header>
                <Switch location={location}>
                    <Route path="/onboarding/instructions" component={Instructions} />
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
});

export default withRouter(connect(mapStateToProps)(Onboarding));
