import React from 'react';
// import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Welcome from '../Onboarding/Welcome';
import Done from '../Onboarding/Done';

import css from './Onboarding.css';

export default withRouter(
    class Onboarding extends React.PureComponent {
        static propTypes = {
            location: PropTypes.object,
        };

        render() {
            const { location } = this.props;
            return (
                <TransitionGroup>
                    <CSSTransition
                        key={location.key}
                        timeout={300}
                        classNames={css.pageTransition}
                        mountOnEnter={true}
                        unmountOnExit={true}
                    >
                        <div className={css.wrapper}>
                            <Switch location={location}>
                                <Route path="/done" component={Done} />
                                <Route path="/" component={Welcome} />
                            </Switch>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            );
        }
    },
);
