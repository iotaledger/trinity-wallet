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
                    <Route path="/onboarding/instructions" component={Instructions} />
                    <Route path="/onboarding/lightserver" component={LightServerSetup} />
                    <Route path="/onboarding/wallet" component={WalletSetup} />
                    <Route path="/onboarding/seed/enter" component={EnterSeed} />
                    <Route exact path="/onboarding/seed/generate" component={GenerateSeed} />
                    <Route exact path="/onboarding/seed/save" component={SaveYourSeedOptions} />
                    <Route path="/onboarding/seed/save/manual" component={SeedManualCopy} />
                    <Route path="/onboarding/seed/save/copy-to-clipboard" component={SeedCopyToClipboard} />
                    <Route path="/onboarding/seed/save/paper-wallet" component={SeedPaperWallet} />
                    <Route exact path="/onboarding/security/password" component={Done} />
                    <Route path="/onboarding/security/password/set" component={Placeholder} />
                    <Route exact path="/onboarding/security/extra" component={Placeholder} />
                    <Route path="/onboarding/security/extra/authenticator" component={Placeholder} />
                    <Route path="/onboarding/done" component={Placeholder} />
                    <Route path="/" component={Welcome} />
                </Switch>
            </div>
        );
    }
}
