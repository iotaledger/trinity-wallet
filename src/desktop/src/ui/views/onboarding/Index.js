import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import Icon from 'ui/components/Icon';

import Welcome from 'ui/views/onboarding/Welcome';
import Login from 'ui/views/onboarding/Login';
import SeedIntro from 'ui/views/onboarding/SeedIntro';
import GenerateSeed from 'ui/views/onboarding/SeedGenerate';
import SaveYourSeedOptions from 'ui/views/onboarding/SeedSave';
import SeedEnter from 'ui/views/onboarding/SeedVerify';
import SeedName from 'ui/views/onboarding/AccountName';
import SecurityEnter from 'ui/views/onboarding/AccountPassword';
import Done from 'ui/views/onboarding/Done';

import css from './index.scss';

/**
 * Onboarding main router wrapper component
 */
class Onboarding extends React.PureComponent {
    static propTypes = {
        /** Is wallet in authorised state */
        isAuthorised: PropTypes.bool,
        /** Onboarding completion status */
        complete: PropTypes.bool,
        /** Browser location */
        location: PropTypes.object,
        /** Browser history obejct */
        history: PropTypes.object,
        /** Theme definitions object */
        theme: PropTypes.object.isRequired,
    };

    state = {
        waveIndex: 0,
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.location.pathname !== nextProps.location.pathname) {
            this.setState({
                waveIndex: this.state.waveIndex + 1,
            });
        }
    }

    getWave(primary) {
        const fill = primary ? this.props.theme.wave.primary : this.props.theme.wave.secondary;
        const wave = `<svg width='3196px' height='227px' viewBox='0 0 3196 227' xmlns='http://www.w3.org/2000/svg'><path fill='${fill}' d='M-1.13686838e-13,227 L-1.13686838e-13,149.222136 C289,149.222136 382,49 782,49 C1182.25708,48.7480077 1288.582,148.706694 1598.03248,149.220507 C1885.47122,148.649282 1979.93914,1.73038667e-16 2379,1.73038667e-16 C2780.102,-0.252524268 2885,149.222526 3195.995,149.222526 C3195.995,178.515341 3196,227 3196,227 L1596,227 L-1.13686838e-13,227 Z'></path></svg>`;
        return `url("data:image/svg+xml;utf8,${wave}")`;
    }

    steps(currentKey) {
        const steps = [
            'seed-intro',
            'seed-generate',
            'seed-save',
            'seed-verify',
            'account-name',
            'account-password',
            'done',
        ];
        const currentIndex = steps.indexOf(currentKey) + 1;

        if (currentIndex < 1) {
            return null;
        }

        return (
            <ul className={css.steps}>
                {steps.map((step, index) => (
                    <li key={step} className={currentIndex > index ? css.active : null}>
                        <span />
                    </li>
                ))}
            </ul>
        );
    }

    render() {
        const { location, complete, isAuthorised, history } = this.props;

        const indexComponent = complete ? Login : Welcome;

        const currentKey = location.pathname.split('/')[2] || '/';

        return (
            <main className={css.onboarding}>
                <header>
                    {!isAuthorised ? (
                        this.steps(currentKey)
                    ) : (
                        <a onClick={() => history.push('/wallet/')}>
                            <Icon icon="cross" size={24} />
                        </a>
                    )}
                </header>
                <TransitionGroup>
                    <CSSTransition key={currentKey} classNames="slide" timeout={1000} mountOnEnter unmountOnExit>
                        <div>
                            <Switch location={location}>
                                <Route path="/onboarding/seed-intro" component={SeedIntro} />
                                <Route path="/onboarding/seed-generate" component={GenerateSeed} />
                                <Route path="/onboarding/seed-save" component={SaveYourSeedOptions} />
                                <Route path="/onboarding/seed-verify" component={SeedEnter} />
                                <Route path="/onboarding/account-name" component={SeedName} />
                                <Route path="/onboarding/account-password" component={SecurityEnter} />
                                <Route path="/onboarding/done" component={Done} />
                                <Route path="/" component={indexComponent} />
                            </Switch>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
                <div className={css.wave}>
                    <div
                        style={{
                            backgroundImage: this.getWave(true),
                            backgroundPosition: `${this.state.waveIndex * 20}% bottom`,
                        }}
                    />
                    <div
                        style={{
                            backgroundImage: this.getWave(),
                            backgroundPosition: `${this.state.waveIndex * 40 + 50}% bottom`,
                        }}
                    />
                </div>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    complete: state.accounts.onboardingComplete,
    isAuthorised: state.wallet.ready,
    theme: state.settings.theme,
});

export default withRouter(connect(mapStateToProps)(Onboarding));
