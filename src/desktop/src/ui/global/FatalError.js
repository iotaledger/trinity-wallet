/*global Electron*/
import React from 'react';
import css from 'ui/views/onboarding/index.scss';

/**
 * Linux missing dependencies tutorial
 */
class FatalError extends React.PureComponent {
    linuxContent = () => {
        return (
            <section>
                <h2>Linux missing dependencies tutorial</h2>
            </section>
        );
    };

    generalContent = () => {
        return (
            <section>
                <h2>Windows/Mac generic error</h2>
            </section>
        );
    };

    render() {
        return (
            <main className={css.onboarding}>
                <header />
                {Electron.getOS() === 'linux' ? this.linuxContent() : this.generalContent()}
                <footer />
            </main>
        );
    }
}

export default FatalError;
