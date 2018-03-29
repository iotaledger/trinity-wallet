import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formatValue, formatUnit, round } from 'libs/util';
import { selectAccountInfo } from 'selectors/account';
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
            <React.Fragment>
                <h1>{`${formatValue(account.balance).toFixed(3)}${formatUnit(account.balance)}`}</h1>
                <h2>{`${currencySymbol} ${fiatBalance}`}</h2>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    account: selectAccountInfo(state),
    marketData: state.marketData,
    settings: state.settings,
});

export default connect(mapStateToProps)(Balance);
