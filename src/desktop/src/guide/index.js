import React from 'react';
import { render } from 'react-dom';
import { Provider as Redux } from 'react-redux';
import store from 'store';
import { BrowserRouter, NavLink, Switch, Route } from 'react-router-dom';

import 'components/App.css';

import Logo from 'components/UI/Logo';
import Theme from 'components/UI/Theme';
import ThemePicker from './ThemePicker';

import css from './index.css';
import Colors from './pages/Colors';
import Buttons from './pages/Buttons';
import Inputs from './pages/Inputs';
import Modals from './pages/Modals';
import Typography from './pages/Typography';

render(
    <Redux store={store}>
        <BrowserRouter>
            <div className={css.styleguide}>
                <Theme />
                <aside>
                    <Logo size={48} />
                    <h1>Trinity</h1>
                    <nav>
                        <NavLink to="/colors">Colors</NavLink>
                        <NavLink to="/typography">Typography</NavLink>
                        <NavLink to="/buttons">Buttons</NavLink>
                        <NavLink to="/inputs">Inputs</NavLink>
                        <NavLink to="/modals">Modals</NavLink>
                    </nav>
                    <hr />
                    <ThemePicker />
                </aside>
                <section>
                    <Switch>
                        <Route path="/colors" component={Colors} />
                        <Route path="/buttons" component={Buttons} />
                        <Route path="/inputs" component={Inputs} />
                        <Route path="/modals" component={Modals} />
                        <Route path="/typography" component={Typography} />
                    </Switch>
                </section>
            </div>
        </BrowserRouter>
    </Redux>,
    document.getElementById('root'),
);
