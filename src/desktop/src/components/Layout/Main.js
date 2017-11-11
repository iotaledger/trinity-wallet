import React from 'react';
// import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Switch, Route, withRouter } from 'react-router-dom';
// import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Balance from '../Main/Balance';
import Login from '../Main/Login';
import Done from '../Onboarding/Done';

// import css from './Main.css';

export default withRouter(
    class Main extends React.PureComponent {
        static propTypes = {
            location: PropTypes.object,
        };

        render() {
            const { location } = this.props;
            return (
                <Switch location={location}>
                    <Route path="/done" component={Done} />
                    <Route exact path="/" component={Login} />
                    <Route path="/balance" component={Balance} />
                    <Route path="/send" component={Balance} />
                    <Route path="/receive" component={Balance} />
                    <Route path="/settings" component={Balance} />
                </Switch>
            );
        }
    },
);
