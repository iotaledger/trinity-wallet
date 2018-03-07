import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import { formatValue, formatUnit, round } from 'libs/util';
import { getCurrencySymbol } from 'libs/currency';

class Balance extends React.PureComponent {
    static propTypes = {
        seed: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        settings: PropTypes.object.isRequired,
        marketData: PropTypes.object.isRequired,
    };

    render() {
        const { account, settings, marketData, seed } = this.props;
        const accountInfo = account.accountInfo[seed.name];

        if (!accountInfo) {
            return null;
        }

        const currencySymbol = getCurrencySymbol(settings.currency);
        const fiatBalance = round(
            accountInfo.balance * marketData.usdPrice / 1000000 * settings.conversionRate,
        ).toFixed(2);

        return (
            <div>
                <strong>{`${formatValue(accountInfo.balance)}${formatUnit(accountInfo.balance)}`}</strong>
                <small>{`${currencySymbol} ${fiatBalance}`}</small>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    account: state.account,
    seed: getSelectedSeed(state),
    marketData: state.marketData,
    settings: state.settings,
});

export default connect(mapStateToProps)(Balance);
