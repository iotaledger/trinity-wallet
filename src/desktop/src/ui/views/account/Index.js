import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import Icon from 'ui/components/Icon';

import Name from 'ui/views/account/Name';
import Seed from 'ui/views/account/Seed';
import Addresses from 'ui/views/account/Addresses';
import Remove from 'ui/views/account/Remove';

import css from '../settings/index.scss';

/**
 * Account settings main wrapper component
 **/
class Account extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        location: PropTypes.object,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { accountNames, t, location, history } = this.props;

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
                            {accountNames.length > 1 ? (
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
                                <Icon icon="cross" size={24} />
                            </a>
                        </header>
                        <Switch location={location}>
                            <Route path="/account/name" component={Name} />
                            <Route path="/account/seed" component={Seed} />
                            <Route path="/account/addresses" component={Addresses} />
                            <Route path="/account/remove" component={Remove} />
                            <Redirect from="/account/" to="/account/name" />
                        </Switch>
                    </section>
                </div>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    accountNames: state.accounts.accountNames,
});

export default connect(mapStateToProps)(translate()(Account));
