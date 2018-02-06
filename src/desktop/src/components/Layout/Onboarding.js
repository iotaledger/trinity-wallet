import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Settings from 'ui/views/settings/Index';
import Welcome from '../Onboarding/Welcome';
import Instructions from '../Onboarding/Instructions';
import WalletSetup from '../Onboarding/WalletSetup';
import GenerateSeed from '../Onboarding/GenerateSeed';
import SeedEnter from '../Onboarding/SeedEnter';
import SeedName from '../Onboarding/SeedName';
import SaveYourSeedOptions from '../Onboarding/SaveYourSeedOptions';
import SecurityEnter from '../Onboarding/SecurityEnter';
import Done from '../Onboarding/Done';

import css from './Onboarding.css';

export default withRouter(
    class Onboarding extends React.PureComponent {
        static propTypes = {
            location: PropTypes.object,
        };

        render() {
            const { location } = this.props;
            return (
                <TransitionGroup>
                    <CSSTransition
                        key={location.key}
                        timeout={300}
                        classNames={css.pageTransition}
                        mountOnEnter
                        unmountOnExit
                    >
                        <div className={css.wrapper}>
                            <Switch location={location}>
                                <Route path="/instructions" component={Instructions} />
                                <Route path="/wallet-setup" component={WalletSetup} />
                                <Route path="/seed/generate" component={GenerateSeed} />
                                <Route exact path="/seed/save/:type" component={SaveYourSeedOptions} />
                                <Route path="/seed/enter" component={SeedEnter} />
                                <Route path="/seed/name" component={SeedName} />
                                <Route path="/security/enter" component={SecurityEnter} />
                                <Route exact path="/security/extra" component={() => {}} />
                                <Route path="/security/extra/authenticator" component={() => {}} />
                                <Route exact path="/settings/:setting?" component={Settings} />
                                <Route path="/done" component={Done} />
                                <Route path="/" component={Welcome} />
                            </Switch>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            );
        }
    },
);
