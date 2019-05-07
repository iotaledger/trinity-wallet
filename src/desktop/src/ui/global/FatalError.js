/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';

import css from 'ui/views/onboarding/index.scss';

/**
 * Linux missing dependencies tutorial
 */
class FatalError extends React.PureComponent {
    static propTypes = {
        error: PropTypes.string,
    };

    linuxContent = () => {
        const { error } = this.props;

        if (typeof error === 'string' && error.indexOf('Unknown or unsupported transport') > -1) {
            return (
                <form className={css.tutorial}>
                    <h1>Cannot connect to Secret Service API</h1>
                    <p>
                        Please check that you are not running Trinity as <strong>root</strong> user
                        <br /> and the <strong>gnome-keyring-daemon</strong> process is running.
                    </p>
                </form>
            );
        }

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
                <p>
                    For some desktop environments (e.g. Kubuntu or KDE), you may need to install an additional library
                    for the communication with libsecret:
                </p>
                <ul>
                    <li>
                        <pre>sudo apt-get install gnome-keyring</pre>
                    </li>
                </ul>
            </form>
        );
    };

    generalContent = () => {
        const { error } = this.props;

        return (
            <form>
                <h1>Error launching wallet</h1>
                <p>There was a fatal error launching the wallet. {error}</p>
            </form>
        );
    };

    render() {
        const { error } = this.props;

        if (error === 'Found old data') {
            return (
                <main className={css.onboarding}>
                    <header />
                    <div>
                        <form className={css.tutorial}>
                            <h1>Pre 0.5.0 version data found</h1>
                            <p>
                                Trinity desktop wallet Windows 7 release 0.5.0 version is not compatible with older
                                Trinity desktop versions. Backup your seeds using version{' '}
                                <a href="https://github.com/iotaledger/trinity-wallet/releases/tag/0.4.6">0.4.6.</a> and
                                reset the wallet.
                            </p>
                        </form>
                    </div>
                </main>
            );
        }

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
