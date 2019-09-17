import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import About from 'ui/views/sweeps/About';
import TransferFunds from 'ui/views/sweeps/TransferFunds';
import Done from 'ui/views/sweeps/Done';

import css from './index.scss';

/**
 * Sweeps functionallity router wrapper component
 */
class Sweeps extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        location: PropTypes.object,
    };

    render() {
        const { location } = this.props;
        const currentKey = location.pathname.split('/')[2] || '/';

        return (
            <main className={css.onboarding}>
                <TransitionGroup>
                    <CSSTransition key={currentKey} classNames="slide" timeout={1000} mountOnEnter unmountOnExit>
                        <div>
                            <Switch location={location}>
                                <Route path="/sweeps/done" component={Done} />
                                <Route path="/sweeps/transfer-funds" component={TransferFunds} />
                                <Route path="/" component={About} />
                            </Switch>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </main>
        );
    }
}

export default withRouter(withTranslation()(Sweeps));
