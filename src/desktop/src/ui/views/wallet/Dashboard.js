import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import TweetEmbed from 'react-tweet-embed';

import List from 'ui/components/List';
import Chart from 'ui/components/Chart';
import Button from 'ui/components/Button';
import Balance from 'ui/components/Balance';
import Icon from 'ui/components/Icon';

import css from './dashboard.css';

/**
 * Wallet dashboard component
 */
class Dashboard extends React.PureComponent {
    static propTypes = {
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t, history } = this.props;

        return (
            <div className={css.dashboard}>
                <div>
                    <section className={css.balance}>
                        <Balance />
                        <hr />
                        <nav>
                            <Button onClick={() => history.push('/wallet/receive')} variant="secondary">
                                Receive
                            </Button>
                            <Button onClick={() => history.push('/wallet/send')} variant="primary">
                                Send
                            </Button>
                        </nav>
                    </section>
                    <section className={css.history}>
                        <List compact />
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

export default translate()(Dashboard);
