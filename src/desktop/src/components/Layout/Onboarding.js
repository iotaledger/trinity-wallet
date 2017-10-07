import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import Welcome from '../Onboarding/Welcome';
import css from './Onboarding.css';

const Test = () => {
    return (
        <div>
            Testpage
            <Link to="/">Home</Link>
        </div>
    );
};

export default class Onboarding extends React.Component {
    render() {
        return (
            <div className={css.wrapper}>
                <Switch>
                    <Route exact path="/" component={Welcome} />
                    <Route exact path="/test" component={Test} />
                </Switch>
            </div>
        );
    }
}
