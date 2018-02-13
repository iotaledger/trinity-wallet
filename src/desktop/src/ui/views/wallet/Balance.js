import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import { getMarketData, getChartData, getPrice } from 'actions/marketData';
import { formatValue, formatUnit, round } from 'libs/util';
import { getCurrencySymbol } from 'libs/currency';
import List from 'ui/components/List';
import Chart from 'ui/components/Chart';

import css from './balance.css';

class Balance extends React.Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        settings: PropTypes.object.isRequired,
        marketData: PropTypes.object.isRequired,
        getChartData: PropTypes.func.isRequired,
        getPrice: PropTypes.func.isRequired,
        getMarketData: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.getChartData();
        this.props.getPrice();
        this.props.getMarketData();
    }

    render() {
        const { t, account, settings, marketData, seed } = this.props;
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

const mapDispatchToProps = {
    getChartData,
    getPrice,
    getMarketData,
};

export default translate('balance')(connect(mapStateToProps, mapDispatchToProps)(Balance));
