import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import List from 'ui/components/List';
import Chart from 'ui/components/Chart';
import Button from 'ui/components/Button';
import Balance from 'ui/components/Balance';

import css from './dashboard.css';

class Dashboard extends React.PureComponent {
    static propTypes = {
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    };

    state = {
        tab: 0,
    };

    render() {
        const { t, history } = this.props;
        const { tab } = this.state;

        return (
            <React.Fragment>
                <section className={css.balance}>
                    <div>
                        <h1>{t('home:balance')}</h1>
                        <Balance />
                    </div>
                    <div>
                        <Button onClick={() => history.push('/wallet/send')} className="outline" variant="primary">
                            Send
                        </Button>
                        <Button onClick={() => history.push('/wallet/receive')} className="outline" variant="primary">
                            Receive
                        </Button>
                    </div>
                    <List compact limit={10} />
                </section>
                <section className={css.market}>
                    <Chart />
                    <div className={css.news}>
                        <article>
                            <div
                                className="thumb"
                                style={{
                                    backgroundImage:
                                        'url(https://cdn-images-1.medium.com/max/2000/1*Kq1eLQgSawwRi_6KoQ2_Aw.jpeg)',
                                }}
                            />
                            <p>
                                <strong>The Tangle: an illustrated introduction.</strong> Part 4: Approvers, balances,
                                and double-spends
                            </p>
                        </article>
                        <article>
                            <div
                                className="thumb"
                                style={{
                                    backgroundImage:
                                        'url(https://pbs.twimg.com/card_img/964051401642074112/VAP25UwQ?format=jpg&name=600x314)',
                                }}
                            />
                            <p>
                                <strong>Announcing the IOTA Ecosystem</strong> - The pace of innovation and development
                                surrounding the IOTA Distributed Ledger Technology...
                            </p>
                        </article>
                        <article>
                            <div
                                className="thumb"
                                style={{
                                    backgroundImage:
                                        'url(https://cdn-images-1.medium.com/max/2000/1*Kq1eLQgSawwRi_6KoQ2_Aw.jpeg)',
                                }}
                            />
                            <p>
                                The Tangle: an illustrated introduction. Part 3: Approvers, balances, and double-spends
                            </p>
                        </article>
                        <article>
                            <div
                                className="thumb"
                                style={{
                                    backgroundImage:
                                        'url(https://cdn-images-1.medium.com/max/2000/1*Kq1eLQgSawwRi_6KoQ2_Aw.jpeg)',
                                }}
                            />
                            <p>
                                The Tangle: an illustrated introduction. Part 2: Approvers, balances, and double-spends
                            </p>
                        </article>
                    </div>
                </section>
            </React.Fragment>
        );
    }
}

const mapStateToProps = () => ({});

export default translate()(connect(mapStateToProps)(Dashboard));
