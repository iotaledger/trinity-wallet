import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { getAccountNamesFromState } from 'selectors/accounts';

import { accumulateBalance } from 'libs/iota/addresses';
import { formatUnit, formatIotas } from 'libs/iota/utils';
import { getFiatBalance, formatFiatBalance } from 'libs/currency';

import Icon from 'ui/components/Icon';

import css from './balance.scss';

/**
 * Current account total balance display component
 */
export class BalanceComponent extends React.PureComponent {
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
        /** Wallet account names */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        settings: PropTypes.object.isRequired,
        /** @ignore */
        marketData: PropTypes.object.isRequired,
    };

    state = {
        balanceIsShort: true,
    };

    componentWillReceiveProps(newProps) {
        if (newProps.index !== this.props.index || newProps.seedIndex !== this.props.seedIndex) {
            this.setState({ balanceIsShort: true });
        }
    }

    render() {
        const {
            summary,
            index,
            accounts,
            accountNames,
            switchAccount,
            seedIndex,
            settings,
            marketData,
        } = this.props;
        const { balanceIsShort } = this.state;

        const accountName = accountNames[summary ? index : seedIndex];

        const balances = accounts.accountInfo[accountName].addressData.map((addressData) => addressData.balance);

        const accountBalance = accumulateBalance(balances);

        const fiatBalance = getFiatBalance(accountBalance, marketData.usdPrice, settings.conversionRate);
        return (
            <div className={css.balance}>
                <h3>{accountName}</h3>
                {summary && (
                    <React.Fragment>
                        <a onClick={() => switchAccount(index === 0 ? accountNames.length - 1 : index - 1)}>
                            <Icon icon="chevronLeft" size={18} />
                        </a>

                        <a onClick={() => switchAccount(index === accountNames.length - 1 ? 0 : index + 1)}>
                            <Icon icon="chevronRight" size={18} />
                        </a>
                    </React.Fragment>
                )}
                <h1 onClick={() => this.setState({ balanceIsShort: !balanceIsShort })}>
                    {formatIotas(accountBalance, balanceIsShort)}
                    <small>{`${formatUnit(accountBalance)}`}</small>
                </h1>
                <h2>{formatFiatBalance(settings.locale, settings.currency, fiatBalance)}</h2>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    seedIndex: state.wallet.seedIndex,
    accounts: state.accounts,
    accountNames: getAccountNamesFromState(state),
    marketData: state.marketData,
    settings: state.settings,
});

export default connect(mapStateToProps)(withTranslation()(BalanceComponent));
