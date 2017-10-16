import React from 'react';
// import { Switch, Route } from 'react-router-dom';
import { Switch, Route, Link } from 'react-router-dom';
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

export default class Onboarding extends React.Component {
    render() {
        return (
            <div className={css.wrapper}>
                <Switch>
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
        );
    }
}
