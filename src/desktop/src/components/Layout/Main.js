import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import Balance from 'components/Main/Balance';
import Receive from 'components/Main/Receive';
import Send from 'components/Main/Send';
import Login from 'components/Main/Login';
import HistoryView from 'components/Main/History';
import Settings from 'ui/views/settings/Index';

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
                    <Route path="/history" component={HistoryView} />
                    <Route exact path="/settings/:setting?" component={Settings} />
                    <Redirect from="/" to="/login" />
                </Switch>
            );
        }
    },
);
