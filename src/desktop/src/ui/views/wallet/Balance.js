import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import { formatValue, formatUnit, round } from 'libs/util';
import { getCurrencySymbol } from 'libs/currency';

import List from 'ui/components/List';
import Chart from 'ui/components/Chart';
import Button from 'ui/components/Button';

import css from './balance.css';

class Balance extends React.PureComponent {
    static propTypes = {
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
        seed: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        settings: PropTypes.object.isRequired,
        marketData: PropTypes.object.isRequired,
    };

    render() {
        const { t, account, settings, marketData, seed, history } = this.props;
        const accountInfo = account.accountInfo[seed.name];

        const currencySymbol = getCurrencySymbol(settings.currency);
        const fiatBalance = round(
            accountInfo.balance * marketData.usdPrice / 1000000 * settings.conversionRate,
        ).toFixed(2);

        return (
            <main>
                <section className={css.balance}>
                    <div>
                        <h1>{t('home:balance')}</h1>
                        <strong>{`${formatValue(accountInfo.balance)} ${formatUnit(accountInfo.balance)}`}</strong>
                        <small>{`${currencySymbol} ${fiatBalance}`}</small>
                    </div>
                    <Button onClick={() => history.push('/wallet/send')} variant="secondary">
                        Send
                    </Button>
                    <List compact limit={10} />
                </section>
                <section className={css.flex}>
                    <Chart />
                </section>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    account: state.account,
    seed: getSelectedSeed(state),
    marketData: state.marketData,
    settings: state.settings,
});

export default translate()(connect(mapStateToProps)(Balance));
