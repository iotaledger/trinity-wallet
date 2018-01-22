import React from 'react';
import { render } from 'react-dom';
import { Provider as Redux } from 'react-redux';
import { persistStore } from 'redux-persist';
import store from 'store';
import { BrowserRouter as Router, withRouter, NavLink, Switch, Route } from 'react-router-dom';

import { translate, I18nextProvider } from 'react-i18next';

import 'components/App.css';

import Logo from 'components/UI/Logo';
import Theme from 'components/UI/Theme';
import Alerts from 'components/UI/Alerts';
import Notifications from 'components/UI/Notifications';
import ThemePicker from './ThemePicker';

import i18next from '../libs/i18next';

import css from './index.css';
import Colors from './pages/Colors';
import Buttons from './pages/Buttons';
import Inputs from './pages/Inputs';
import Modals from './pages/Modals';
import Typography from './pages/Typography';
import Lists from './pages/Lists';

const Intro = () => {
    return (
        <div>
            <h1>Style guide</h1>
            <p>
                This styleguide is created and maintained to act as a central location that describes the authoring and
                use of style guides created to ensure consistency across a the wallet. The style guide may cover
                anything from usage of colors, components and page layout.
            </p>
        </div>
    );
};

class Guide extends React.Component {
    componentWillMount() {
        persistStore(store);
    }

    render() {
        return (
            <div className={css.styleguide}>
                <Theme />
                <Alerts />
                <Notifications />
                <aside>
                    <Logo size={48} />
                    <h1>Trinity</h1>
                    <nav>
                        <NavLink to="/colors">Colors</NavLink>
                        <NavLink to="/typography">Typography</NavLink>
                        <NavLink to="/buttons">Buttons</NavLink>
                        <NavLink to="/inputs">Inputs</NavLink>
                        <NavLink to="/modals">Modals & Alerts</NavLink>
                        <NavLink to="/lists">Lists</NavLink>
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
                        <Route path="/lists" component={Lists} />
                        <Route path="/" component={Intro} />
                    </Switch>
                </section>
            </div>
        );
    }
}

const App = withRouter(translate('App')(Guide));

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
