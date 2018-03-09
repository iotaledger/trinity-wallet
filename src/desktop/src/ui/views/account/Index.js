import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import Icon from 'ui/components/Icon';
import ModalPassword from 'ui/components/modal/Password';

import Name from 'ui/views/account/Name';
import Seed from 'ui/views/account/Seed';
import Addresses from 'ui/views/account/Addresses';
import Remove from 'ui/views/account/Remove';

import css from '../settings/index.css';

/** Account settings main wrapper component */
class Account extends React.PureComponent {
    static propTypes = {
        /** Browser location object */
        location: PropTypes.object,
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Temporary account state data
         * @ignore
         */
        tempAccount: PropTypes.object,
        /** Translation helper
         * @param {string} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        vault: null,
        password: null,
    };

    NameComponent = () => {
        return <Name {...this.state} />;
    };

    render() {
        const { t, location, history } = this.props;
        const { vault } = this.state;

        if (!vault) {
            return (
                <ModalPassword
                    isOpen
                    inline
                    onSuccess={(password, vault) => this.setState({ password, vault })}
                    onClose={() => history.push('/wallet/')}
                    title={t('Enter password to access account settings')}
                />
            );
        }

        const PropsRoute = ({ component, ...props }) => {
            return (
                <Route
                    {...props}
                    render={() => {
                        return React.createElement(component, this.state);
                    }}
                />
            );
        };

        return (
            <main className={css.settings}>
                <div>
                    <section>
                        <nav>
                            <NavLink to="/account/name">
                                <Icon icon="user" size={20} /> <strong>{t('addAdditionalSeed:accountName')}</strong>
                            </NavLink>
                            <NavLink to="/account/seed">
                                <Icon icon="eye" size={20} /> <strong>{t('accountManagement:viewSeed')}</strong>
                            </NavLink>
                            <NavLink to="/account/addresses">
                                <Icon icon="bookmark" size={20} />{' '}
                                <strong>{t('accountManagement:viewAddresses')}</strong>
                            </NavLink>
                            {vault.seeds.length > 1 ? (
                                <NavLink to="/account/remove">
                                    <Icon icon="trash" size={20} />{' '}
                                    <strong>{t('accountManagement:deleteAccount')}</strong>
                                </NavLink>
                            ) : null}
                        </nav>
                    </section>
                    <section className={css.content}>
                        <header>
                            <a onClick={() => history.push('/wallet/')}>
                                <Icon icon="cross" size={40} />
                            </a>
                        </header>
                        <Switch location={location}>
                            <PropsRoute path="/account/name" component={Name} />
                            <PropsRoute path="/account/seed" component={Seed} />
                            <PropsRoute path="/account/addresses" component={Addresses} />
                            <PropsRoute path="/account/remove" component={Remove} />
                            <Redirect from="/account/" to="/account/name" />
                        </Switch>
                    </section>
                </div>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    tempAccount: state.tempAccount,
});

export default translate()(connect(mapStateToProps)(Account));
