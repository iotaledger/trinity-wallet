import React from 'react';
// import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
// import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Balance from '../Main/Balance';
import Receive from '../Main/Receive';
import Send from '../Main/Send';
import Login from '../Main/Login';

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
                    <Route path="/login" component={Login} />
                    <Route path="/balance" component={Balance} />
                    <Route path="/send" component={Send} />
                    <Route path="/receive" component={Receive} />
                    <Route exact path="/settings" component={Balance} />
                    <Route path="/settings/add-seed" component={Balance} />
                    <Redirect from="/" to="/login" />
                </Switch>
            );
        }
    },
);
