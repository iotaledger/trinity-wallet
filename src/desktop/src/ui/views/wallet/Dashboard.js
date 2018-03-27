import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import Icon from 'ui/components/Icon';
import List from 'ui/components/List';
import Chart from 'ui/components/Chart';
import Button from 'ui/components/Button';
import Balance from 'ui/components/Balance';

import Receive from 'ui/views/wallet/Receive';
import Send from 'ui/views/wallet/Send';

import css from './dashboard.css';

/**
 * Wallet dashboard component
 */
class Dashboard extends React.PureComponent {
    static propTypes = {
        /* Browser location objects */
        location: PropTypes.object,
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
        deepLinks: PropTypes.object.isRequired,
    };

    componentWillMount() {
        if (this.props.deepLinks.address !== '') {
            this.props.history.push('/wallet/send');
        }
    }

    render() {
        const { t, history, location } = this.props;

        const route = location.pathname.split('/')[2] || '/';
        const subroute = location.pathname.split('/')[3] || null;

        const balanceOpen = ['send', 'receive'].indexOf(route) > -1;

        return (
            <div className={css.dashboard}>
                <div>
                    <section className={classNames(css.balance, balanceOpen ? css.open : null)}>
                        <span onClick={() => history.push('/wallet/')}>
                            <Icon icon="cross" size={32} />
                        </span>
                        <Balance />
                        <hr />
                        <div>
                            <Switch location={location}>
                                <Route path="/wallet/send" component={Send} />
                                <Route path="/wallet/receive" component={Receive} />
                            </Switch>
                        </div>
                        <nav>
                            <Button onClick={() => history.push('/wallet/receive')} variant="secondary">
                                {t('history:receive').toLowerCase()}
                            </Button>
                            <Button onClick={() => history.push('/wallet/send')} variant="primary">
                                {t('history:send').toLowerCase()}
                            </Button>
                        </nav>
                    </section>
                    <section className={css.history}>
                        <List
                            setItem={(item) =>
                                item !== null ? history.push(`/wallet/history/${item}`) : history.push('/wallet/')
                            }
                            currentItem={subroute}
                        />
                    </section>
                </div>
                <div>
                    <section className={css.market}>
                        <Chart />
                    </section>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    deepLinks: state.deepLinks,
});

export default translate()(connect(mapStateToProps)(Dashboard));
