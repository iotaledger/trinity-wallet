import React from 'react';
import PropTypes from 'prop-types';
import { render } from 'react-dom';
import { Provider as Redux } from 'react-redux';
import store from 'store';
import { BrowserRouter as Router, withRouter, NavLink, Switch, Route } from 'react-router-dom';

import { translate, I18nextProvider } from 'react-i18next';

import 'ui/index.scss';

import Logo from 'ui/components/Logo';
import Theme from 'ui/global/Theme';
import Alerts from 'ui/global/Alerts';
import Waves from 'ui/components/Waves';
import ThemePicker from './ThemePicker';

import i18next from '../libs/i18next';

import css from './index.scss';
import Colors from './pages/Colors';
import Buttons from './pages/Buttons';
import Inputs from './pages/Inputs';
import Modals from './pages/Modals';
import Typography from './pages/Typography';
import Icons from './pages/Icons';

const Intro = () => {
    return (
        <div>
            <h1>Style guide</h1>
            <p>
                This styleguide is created and maintained to act as a central location that describes the authoring and
                use of style guides created to ensure consistency across a the wallet. The style guide may cover
                anything from usage of colors, components and page layout.
            </p>
            <Waves height="250px" />
        </div>
    );
};

const Guide = (props) => {
    return (
        <div className={css.styleguide}>
            <Theme />
            <Alerts />
            <aside>
                <NavLink to="/">
                    <Logo size={48} />
                </NavLink>
                <h1>Trinity</h1>

                <ThemePicker />
                <hr />
                <nav>
                    <NavLink to="/colors">Colors</NavLink>
                    <NavLink to="/icons">Icons</NavLink>
                    <NavLink to="/typography">Typography</NavLink>
                    <NavLink to="/buttons">Buttons</NavLink>
                    <NavLink to="/inputs">Inputs</NavLink>
                    <NavLink to="/modals">Modals & Alerts</NavLink>
                </nav>
            </aside>
            <section className={props.location.pathname === '/' ? css.intro : null}>
                <Switch>
                    <Route path="/colors" component={Colors} />
                    <Route path="/icons" component={Icons} />
                    <Route path="/buttons" component={Buttons} />
                    <Route path="/inputs" component={Inputs} />
                    <Route path="/modals" component={Modals} />
                    <Route path="/typography" component={Typography} />
                    <Route path="/" component={Intro} />
                </Switch>
            </section>
        </div>
    );
};

Guide.propTypes = {
    /** Browser location */
    location: PropTypes.object,
};

const App = withRouter(translate()(Guide));

render(
    <Redux store={store}>
        <I18nextProvider i18n={i18next}>
            <Router>
                <App />
            </Router>
        </I18nextProvider>
    </Redux>,
    document.getElementById('root'),
);
