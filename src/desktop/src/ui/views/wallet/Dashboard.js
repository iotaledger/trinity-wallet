import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import List from 'ui/components/List';
import Chart from 'ui/components/Chart';
import Button from 'ui/components/Button';
import Balance from 'ui/components/Balance';
import { sendAmount } from 'actions/deepLinks';

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
        deepLinks: PropTypes.object.isRequired,
    };

    state = {
        address: '',
        amount: '',
        message: '',
    };

    componentWillMount() {
        if (this.props.deepLinks.address === '') {
        } else {
            this.props.history.push('/wallet/send');
        }
    }

    render() {
        const { t, history } = this.props;

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

                    </div>
                </section>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    deepLinks: state.deepLinks,
});

const mapDispatchToProps = {
    sendAmount,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
