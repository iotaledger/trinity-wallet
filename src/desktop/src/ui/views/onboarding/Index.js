import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Logo from 'ui/components/Logo';

import Settings from 'ui/views/settings/Index';
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

import css from 'ui/index.css';

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
            <div className={css.main}>
                <header className={css.centered}>
                    <Logo size={64} />
                </header>
                <TransitionGroup>
                    <CSSTransition
                        key={location.key}
                        timeout={300}
                        classNames={css.pageTransition}
                        mountOnEnter
                        unmountOnExit
                    >
                        <Switch location={location}>
                            <Route path="/onboarding/instructions" component={Instructions} />
                            <Route path="/onboarding/seed-intro" component={SeedIntro} />
                            <Route path="/onboarding/seed-generate" component={GenerateSeed} />
                            <Route exact path="/onboarding/seed-save" component={SaveYourSeedOptions} />
                            <Route path="/onboarding/seed-verify" component={SeedEnter} />
                            <Route path="/onboarding/account-name" component={SeedName} />
                            <Route path="/onboarding/account-password" component={SecurityEnter} />
                            <Route path="/onboarding/done" component={Done} />
                            <Route exact path="/settings/:setting?" component={Settings} />
                            <Route path="/" component={indexComponent} />
                        </Switch>
                    </CSSTransition>
                </TransitionGroup>
            </div>
        );
    }
}

export default withRouter(Onboarding);
