import React from 'react';
// import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Switch, Route, Link, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Welcome from '../Onboarding/Welcome';
import Instructions from '../Onboarding/Instructions';
import LightServerSetup from '../Onboarding/LightServerSetup';
import WalletSetup from '../Onboarding/WalletSetup';
import GenerateSeed from '../Onboarding/GenerateSeed';
import EnterSeed from '../Onboarding/EnterSeed';
import SaveYourSeedOptions from '../Onboarding/SaveYourSeedOptions';
import SeedManualCopy from '../Onboarding/SeedManualCopy';
import SeedCopyToClipboard from '../Onboarding/SeedCopyToClipboard';
import SeedPaperWallet from '../Onboarding/SeedPaperWallet';
import SecurityIntro from '../Onboarding/SecurityIntro';
import SecurityEnter from '../Onboarding/SecurityEnter';

import css from './Onboarding.css';
console.log(css.pageTransition);
const Placeholder = () => {
    return (
        <div>
            Placeholder
            <Link to="/">Home</Link>
        </div>
    );
};

const Done = () => {
    return <div>Hi! Nice to meet you.</div>;
};

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
                        mountOnEnter={true}
                        unmountOnExit={true}
                    >
                        <div className={css.wrapper}>
                            <Switch location={location}>
                                <Route path="/instructions" component={Instructions} />
                                <Route path="/lightserver" component={LightServerSetup} />
                                <Route path="/wallet" component={WalletSetup} />
                                <Route path="/seed/generate" component={GenerateSeed} />
                                <Route exact path="/seed/save" component={SaveYourSeedOptions} />
                                <Route path="/seed/save/manual" component={SeedManualCopy} />
                                <Route path="/seed/save/clipboard" component={SeedCopyToClipboard} />
                                <Route path="/seed/save/paperwallet" component={SeedPaperWallet} />
                                <Route path="/seed/enter" component={EnterSeed} />
                                <Route path="/security/intro" component={SecurityIntro} />
                                <Route path="/security/set" component={SecurityEnter} />
                                <Route exact path="/security/extra" component={Placeholder} />
                                <Route path="/security/extra/authenticator" component={Placeholder} />
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
