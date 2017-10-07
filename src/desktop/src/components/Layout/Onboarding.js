import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Welcome from '../Onboarding/Welcome';
import css from './Onboarding.css';

export default class Onboarding extends React.PureComponent {

    render() {
        return (
            <div className={css.wrapper}>
                <Switch>
                    <Route exact path="/" component={Welcome} />
                </Switch>
            </div>
        );
    }

}
