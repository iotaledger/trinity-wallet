import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formatValue, formatUnit } from 'libs/iota/utils';
import { round } from 'libs/utils';
import { selectAccountInfo } from 'selectors/accounts';
import { getCurrencySymbol } from 'libs/currency';

class Balance extends React.PureComponent {
    static propTypes = {
        account: PropTypes.object.isRequired,
        settings: PropTypes.object.isRequired,
        marketData: PropTypes.object.isRequired,
    };

    render() {
        const { account, settings, marketData } = this.props;

        if (!account) {
            return null;
        }

        const currencySymbol = getCurrencySymbol(settings.currency);
        const fiatBalance = round(account.balance * marketData.usdPrice / 1000000 * settings.conversionRate).toFixed(2);

        return (
            <div>
                <strong>{`${formatValue(account.balance).toFixed(3)}${formatUnit(account.balance)}`}</strong>
                <small>{`${currencySymbol} ${fiatBalance}`}</small>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    account: selectAccountInfo(state),
    marketData: state.marketData,
    settings: state.settings,
});

export default connect(mapStateToProps)(Balance);
