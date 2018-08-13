import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { formatValue, formatUnit } from 'libs/iota/utils';
import { round, roundDown } from 'libs/utils';
import { getCurrencySymbol } from 'libs/currency';

import Icon from 'ui/components/Icon';

import css from './balance.scss';

/**
 * Current account total balance display component
 */
class Balance extends React.PureComponent {
    static propTypes = {
        /** Should component show overall balance by default */
        summary: PropTypes.bool,
        /** Current account index, where -1 is total balance */
        index: PropTypes.number,
        /** Switch Balance account
         * @param {number} index - target account index
         */
        switchAccount: PropTypes.func,
        /** @ignore */
        seedIndex: PropTypes.number.isRequired,
        /** @ignore */
        accounts: PropTypes.object.isRequired,
        /** @ignore */
        settings: PropTypes.object.isRequired,
        /** @ignore */
        marketData: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
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
        const { summary, index, accounts, switchAccount, seedIndex, settings, marketData, t } = this.props;
        const { balanceIsShort } = this.state;

        const accountName =
            summary && index === -1 ? t('totalBalance') : accounts.accountNames[summary ? index : seedIndex];

        const accountBalance =
            summary && index === -1
                ? Object.entries(accounts.accountInfo).reduce((total, account) => total + account[1].balance, 0)
                : accounts.accountInfo[accountName].balance;

        const currencySymbol = getCurrencySymbol(settings.currency);
        const fiatBalance = round(accountBalance * marketData.usdPrice / 1000000 * settings.conversionRate, 2).toFixed(
            2,
        );

        const balance = !balanceIsShort
            ? formatValue(accountBalance)
            : roundDown(formatValue(accountBalance), 1) +
              (accountBalance < 1000 || this.getDecimalPlaces(formatValue(accountBalance)) <= 1 ? '' : '+');

        return (
            <div className={css.balance}>
                <h3>{accountName}</h3>
                {summary && (
                    <React.Fragment>
                        <a onClick={() => switchAccount(index + 1)}>
                            <Icon icon="chevronLeft" size={18} />
                        </a>

                        <a onClick={() => switchAccount(index - 1)}>
                            <Icon icon="chevronRight" size={18} />
                        </a>
                    </React.Fragment>
                )}
                <h1 onClick={() => this.setState({ balanceIsShort: !balanceIsShort })}>
                    {`${balance}`}
                    <small>{`${formatUnit(accountBalance)}`}</small>
                </h1>
                <h2>{`${currencySymbol} ${fiatBalance}`}</h2>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    seedIndex: state.wallet.seedIndex,
    accounts: state.accounts,
    marketData: state.marketData,
    settings: state.settings,
});

export default connect(mapStateToProps)(translate()(Balance));
