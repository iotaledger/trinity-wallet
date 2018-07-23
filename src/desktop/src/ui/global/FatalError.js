/* global Electron */
import React from 'react';
import css from 'ui/views/onboarding/index.scss';

/**
 * Linux missing dependencies tutorial
 */
class FatalError extends React.PureComponent {
    linuxContent = () => {
        return (
            <form className={css.tutorial}>
                <h1>Missing security dependencies</h1>
                <p>
                    Your Linux distribution is missing libsecret library that is required for Trinity to securely store
                    and retrieve sensitive information.
                </p>
                <p>Depending on your distribution, you will need to run the following command:</p>
                <ul>
                    <li>
                        Debian/Ubuntu: <pre>sudo apt-get install libsecret-1-dev</pre>
                    </li>
                    <li>
                        Red Hat-based: <pre>sudo yum install libsecret-devel</pre>
                    </li>
                    <li>
                        Arch Linux: <pre>sudo pacman -S libsecret</pre>
                    </li>
                </ul>
            </form>
        );
    };

    generalContent = () => {
        return (
            <form>
                <h1>Error launching wallet</h1>
                <p>There was a fatal error launching the wallet.</p>
            </form>
        );
    };

    render() {
        return (
            <main className={css.onboarding}>
                <header />
                <div>
                    <div>{Electron.getOS() === 'linux' ? this.linuxContent() : this.generalContent()}</div>
                </div>
            </main>
        );
    }
}

export default FatalError;
