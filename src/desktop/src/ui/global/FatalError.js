/* global Electron */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Button from 'ui/components/Button';

import css from 'ui/views/onboarding/index.scss';

import settings from '../../../package.json';

/**
 * Desktop fatal error display component
 */
const FatalError = ({ error, history }) => {
    const [errors, setErrors] = useState(typeof window.fatalErrors === 'object' ? window.fatalErrors : []);

    useEffect(() => {
        window.fatalErrors = (msg) => {
            setErrors(errors.concat(msg));
        };

        return () => {
            window.fatalErrors = null;
        };
    }, []);

    const getContent = () => {
        if (typeof error === 'string' && error.indexOf('Unknown or unsupported transport') > -1) {
            return (
                <form>
                    <h1>Cannot connect to Secret Service API</h1>
                    <p>
                        Please check that you are not running Trinity as <strong>root</strong> user
                        <br /> and the <strong>gnome-keyring-daemon</strong> process is running.
                    </p>
                </form>
            );
        }

        if (
            typeof error === 'string' &&
            typeof Electron === 'object' &&
            Electron.getOS() === 'win32' &&
            error.indexOf('Unable to open a realm at path') > -1 &&
            error.indexOf('No such file or directory Path') > -1
        ) {
            return (
                <form>
                    <h1>Cannot start wallet</h1>
                    <p>
                        The database Trinity uses (Realm) is currently incompatible with Windows OS usernames that
                        contain non-Latin characters. We are working on a fix.
                    </p>
                </form>
            );
        }

        if (
            typeof error === 'string' &&
            ([
                'The name org.freedesktop.secrets was not provided by any .service files',
                'Cannot create an item in a locked collection',
            ].indexOf(error) > -1 ||
                /disabled(.*)disabled:/g.test(error))
        ) {
            return (
                <form className={css.tutorial}>
                    <h1>Missing security dependencies</h1>
                    <p>
                        Your Linux distribution is missing libsecret library that is required for Trinity to securely
                        store and retrieve sensitive information.
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
                        For some desktop environments (e.g. Kubuntu or KDE), you may need to install an additional
                        library for the communication with libsecret:
                    </p>
                    <ul>
                        <li>
                            <pre>sudo apt-get install gnome-keyring</pre>
                        </li>
                    </ul>
                </form>
            );
        }

        if (
            typeof error === 'string' &&
            error.indexOf('Provided schema version') > -1 &&
            error.indexOf('is less than last set version') > -1
        ) {
            return (
                <form className={css.tutorial}>
                    <h1>Newer Trinity version data found</h1>
                    <p>
                        Trinity found data installed by a newer version of Trinity which is incompatible with version{' '}
                        <strong>{settings.version}</strong>.{' '}
                        <a href="https://trinity.iota.org/#download">Download the latest version</a> or update Trinity
                        now.
                    </p>
                    <Button type="button" variant="primary" onClick={() => Electron.autoUpdate()}>
                        Update Trinity now
                    </Button>
                </form>
            );
        }

        if (error === 'Found old data') {
            return (
                <form className={css.tutorial}>
                    <h1>Windows 7 incompatible Trinity data found</h1>
                    <p>
                        Incompatible wallet data was found used by the wallet version <strong>0.4.6</strong> or older.
                    </p>
                    <p>Make sure you have a backup of your seeds and reset the wallet in Advanced settings.</p>
                    <Button type="button" variant="primary" onClick={() => history.push('/settings/advanced')}>
                        Go to Advanced settings
                    </Button>
                </form>
            );
        }

        return (
            <form>
                <h1>Error launching wallet</h1>
                <p>There was a fatal error launching the wallet.</p>
                <pre>
                    <span key="error">{error}</span>
                    {errors.map((err, i) => (
                        <span key={i}>{err}</span>
                    ))}
                </pre>
            </form>
        );
    };

    return (
        <main className={css.onboarding}>
            <header />
            <div>
                <div>{getContent()}</div>
            </div>
        </main>
    );
};

FatalError.propTypes = {
    error: PropTypes.string,
    history: PropTypes.object.isRequired,
};

export default FatalError;
