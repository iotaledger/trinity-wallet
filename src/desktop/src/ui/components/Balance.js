import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formatValue, formatUnit } from 'libs/iota/utils';
import { round } from 'libs/utils';
import { selectAccountInfo, getSelectedAccountName } from 'selectors/accounts';

import { getCurrencySymbol } from 'libs/currency';

import css from './balance.scss';

class Balance extends React.PureComponent {
    static propTypes = {
        account: PropTypes.object.isRequired,
        accountName: PropTypes.string.isRequired,
        settings: PropTypes.object.isRequired,
        marketData: PropTypes.object.isRequired,
    };

    render() {
        const { account, accountName, settings, marketData } = this.props;

        if (!account) {
            return null;
        }

        const currencySymbol = getCurrencySymbol(settings.currency);
        const fiatBalance = round(account.balance * marketData.usdPrice / 1000000 * settings.conversionRate, 2).toFixed(
            2,
        );

        return (
            <div className={css.balance}>
                <h3>{accountName}</h3>
                <h1>
                    {`${formatValue(account.balance)}`}
                    <small>{`${formatUnit(account.balance)}`}</small>
                </h1>
                <h2>{`${currencySymbol} ${fiatBalance}`}</h2>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    account: selectAccountInfo(state),
    accountName: getSelectedAccountName(state),
    marketData: state.marketData,
    settings: state.settings,
});

export default connect(mapStateToProps)(Balance);
