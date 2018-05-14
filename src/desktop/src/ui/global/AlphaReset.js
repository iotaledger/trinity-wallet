/*global Electron*/
import React from 'react';

import { DESKTOP_VERSION } from 'config';

import Button from 'ui/components/Button';

import css from 'ui/views/onboarding/index.scss';

/**
 * Alpha version activation view
 */
class Activation extends React.PureComponent {
    resetWallet = (e) => {
        e.preventDefault();

        localStorage.clear();

        Electron.clearStorage();
        Electron.setActiveVersion(DESKTOP_VERSION);

        location.reload();
    };

    render() {
        return (
            <main className={css.onboarding}>
                <header />
                <section>
                    <form className="center" onSubmit={this.resetWallet}>
                        <fieldset>
                            <h2>This alpha release requires a full wallet reset!</h2>
                            <p>The wallet will be reset to defaults and all your saved data will be lost.</p>
                            <Button type="submit" variant="primary">
                                Reset wallet
                            </Button>
                        </fieldset>
                    </form>
                </section>
                <footer />
            </main>
        );
    }
}

export default Activation;
