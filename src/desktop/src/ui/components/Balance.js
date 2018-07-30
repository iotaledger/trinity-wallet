import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formatValue, formatUnit } from 'libs/iota/utils';
import { round, roundDown } from 'libs/utils';
import { selectAccountInfo, getSelectedAccountName } from 'selectors/accounts';

import { getCurrencySymbol } from 'libs/currency';

import css from './balance.scss';

/**
 * Current account total balance display component
 */
class Balance extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        account: PropTypes.object.isRequired,
        /** @ignore */
        accountName: PropTypes.string.isRequired,
        /** @ignore */
        settings: PropTypes.object.isRequired,
        /** @ignore */
        marketData: PropTypes.object.isRequired,
    };

    state = {
        balanceIsShort: true,
    };

    componentWillReceiveProps(newProps) {
        if (newProps.accountName !== this.props.accountName) {
            this.setState({ balanceIsShort: true });
        }
    }

    getDecimalPlaces(n) {
        const s = `+${n}`;
        const match = /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(s);

        if (!match) {
            return 0;
        }

        return Math.max(0, (match[1] === '0' ? 0 : (match[1] || '').length) - (match[2] || 0));
    }

    render() {
        const { account, accountName, settings, marketData } = this.props;
        const { balanceIsShort } = this.state;

        if (!account) {
            return null;
        }

        const currencySymbol = getCurrencySymbol(settings.currency);
        const fiatBalance = round(
            ((account.balance * marketData.usdPrice) / 1000000) * settings.conversionRate,
            2,
        ).toFixed(2);

        const balance = !balanceIsShort
            ? formatValue(account.balance)
            : roundDown(formatValue(account.balance), 1) +
              (account.balance < 1000 || this.getDecimalPlaces(formatValue(account.balance)) <= 1 ? '' : '+');

        return (
            <div className={css.balance}>
                <h3>{accountName}</h3>
                <h1 onClick={() => this.setState({ balanceIsShort: !balanceIsShort })}>
                    {`${balance}`}
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
