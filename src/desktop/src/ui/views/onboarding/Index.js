/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { setOnboardingName } from 'actions/ui';

import Icon from 'ui/components/Icon';
import Waves from 'ui/components/Waves';

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
        /** @ignore */
        setOnboardingName: PropTypes.func.isRequired,
        /** @ignore */
        isAuthorised: PropTypes.bool,
        /** @ignore */
        complete: PropTypes.bool,
        /** @ignore */
        location: PropTypes.object,
        /** @ignore */
        history: PropTypes.object,
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

    /**
     * Reset onboarding seed, navigate to Dashboard view
     * @returns {undefined}
     */
    closeOnboarding = () => {
        const { setOnboardingName } = this.props;

        Electron.setOnboardingSeed(null);
        setOnboardingName('');
        this.props.history.push('/wallet/');
    };

    /**
     * Render onboarding completion steps
     * @param {string} currentKey - Current onboarding view slug
     * @returns {object} - Completion steps
     */
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
        const { location, complete, isAuthorised } = this.props;

        const indexComponent = complete ? Login : Welcome;

        const currentKey = location.pathname.split('/')[2] || '/';

        return (
            <main className={css.onboarding}>
                <header>
                    {!isAuthorised ? (
                        this.steps(currentKey)
                    ) : (
                        <a onClick={this.closeOnboarding}>
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
                <Waves offset={this.state.waveIndex * 20} bottom="70px" />
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    complete: state.accounts.onboardingComplete,
    setOnboardingName,
    isAuthorised: state.wallet.ready,
});

export default withRouter(connect(mapStateToProps)(Onboarding));
