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

export default class Onboarding extends React.Component {
    render() {
        return (
            <div className={css.wrapper}>
                <Switch>
                    <Route exact path="/" component={Welcome} />
                    <Route exact path="/onboarding/instructions" component={Instructions} />
                    <Route exact path="/onboarding/lightserver" component={LightServerSetup} />
                    <Route exact path="/onboarding/wallet" component={WalletSetup} />
                    <Route exact path="/onboarding/seed/enter" component={EnterSeed} />
                    <Route exact path="/onboarding/seed/generate" component={GenerateSeed} />
                    <Route exact path="/onboarding/seed/generate/save/options" component={SaveYourSeedOptions} />
                    <Route exact path="/onboarding/seed/generate/save/manual" component={SeedManualCopy} />
                    <Route
                        exact
                        path="/onboarding/seed/generate/save/copy-to-clipboard"
                        component={SeedCopyToClipboard}
                    />
                    <Route exact path="/onboarding/seed/generate/save/paper-wallet" component={SeedPaperWallet} />
                    <Route exact path="/onboarding/security/password" component={Placeholder} />
                    <Route exact path="/onboarding/security/password/set" component={Placeholder} />
                    <Route exact path="/onboarding/security/extra" component={Placeholder} />
                    <Route exact path="/onboarding/security/extra/authenticator" component={Placeholder} />
                    <Route exact path="/onboarding/done" component={Placeholder} />
                </Switch>
            </div>
        );
    }
}
