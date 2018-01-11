import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import { setCurrency, setTimeframe, getMarketData, getChartData, getPrice } from 'actions/marketData';
import { formatValue, formatUnit, round } from 'libs/util';
import { getCurrencySymbol } from 'libs/currency';
import { getAccountInfoAsync, getNewAddressAsync } from 'actions/seeds';
import Template, { Content } from 'components/Main/Template';
import HistoryList from 'components/UI/HistoryList';
import Chart from 'components/UI/Chart';
import css from 'components/Main/Balance.css';

class Balance extends React.Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        getAccountInfoAsync: PropTypes.func,
        getNewAddressAsync: PropTypes.func,
        seed: PropTypes.shape({
            name: PropTypes.string,
            seed: PropTypes.string,
            addresses: PropTypes.array,
        }).isRequired,
        account: PropTypes.object.isRequired,
        settings: PropTypes.object.isRequired,
        marketData: PropTypes.object.isRequired,
        setCurrency: PropTypes.func.isRequired,
        setTimeframe: PropTypes.func.isRequired,
        getChartData: PropTypes.func.isRequired,
        getPrice: PropTypes.func.isRequired,
        getMarketData: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.getChartData();
        this.props.getPrice();
        this.props.getMarketData();
    }

    getBalance = () => {
        const { getAccountInfoAsync, seed } = this.props;
        getAccountInfoAsync(seed.seed);
    };

    getNewAddress = () => {
        const { getNewAddressAsync, seed } = this.props;
        getNewAddressAsync(seed.seed);
    };

    getDecimalPlaces(n) {
        const s = String(Number(n));
        const match = /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(s);
        if (!match) {
            return 0;
        }
        return Math.max(0, (match[1] === '0' ? 0 : (match[1] || '').length) - (match[2] || 0));
    }

    render() {
        const { t, account, settings, marketData, seed, setCurrency, setTimeframe } = this.props;
        const accountInfo = account.accountInfo[seed.name];

        const currencySymbol = getCurrencySymbol(settings.currency);
        const fiatBalance = round(
            accountInfo.balance * marketData.usdPrice / 1000000 * settings.conversionRate,
        ).toFixed(2);

        return (
            <Template>
                <Content>
                    <section className={css.balance}>
                        <div>
                            <h1>{t('home:balance')}</h1>
                            <strong>{`${formatValue(accountInfo.balance)} ${formatUnit(accountInfo.balance)}`}</strong>
                            <small>{`${currencySymbol} ${fiatBalance}`}</small>
                        </div>
                        <HistoryList
                            inline
                            transfers={accountInfo.transfers.length ? accountInfo.transfers : []}
                            limit={10}
                            addresses={Object.keys(accountInfo.addresses)}
                        />
                    </section>
                    <section className={css.flex}>
                        <Chart marketData={marketData} setCurrency={setCurrency} setTimeframe={setTimeframe} />
                    </section>
                </Content>
            </Template>
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
    getAccountInfoAsync,
    getNewAddressAsync,
    getChartData,
    getPrice,
    getMarketData,
    setCurrency,
    setTimeframe,
};

export default translate('balance')(connect(mapStateToProps, mapDispatchToProps)(Balance));
