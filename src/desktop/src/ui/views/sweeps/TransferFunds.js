import assign from 'lodash/assign';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import SeedStore from 'libs/SeedStore';

import { recoverLockedFunds } from 'actions/sweeps';

import {
    getSelectedAccountName,
    getSelectedAccountMeta,
    getSpentAddressDataWithBalanceForSelectedAccount,
    getBroadcastedTransactionsForSelectedAccount,
    selectLatestAddressFromAccountFactory,
} from 'selectors/accounts';

import Button from 'ui/components/Button';

/**
 * Sweep functionality "Transfer Funds" screen"
 */
class TransferFunds extends React.PureComponent {
    static propTypes = {
        /** Currently selected account name */
        accountName: PropTypes.string.isRequired,
        /** @ignore */
        accountMeta: PropTypes.object.isRequired,
        /** Spent address data with balance for selected account */
        spentAddressDataWithBalance: PropTypes.array.isRequired,
        /** Broadcasted transactions for selected account */
        broadcastedTransactions: PropTypes.array.isRequired,
        /** Latest (unused) address for selected account */
        latestAddress: PropTypes.string.isRequired,
        /** @ignore */
        password: PropTypes.object,
        /** @ignore */
        sweepsStatuses: PropTypes.object.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        recoverLockedFunds: PropTypes.func.isRequired,
    };

    getAddressData() {
        const { spentAddressDataWithBalance, broadcastedTransactions } = this.props;

        const inputTransactions = filter(broadcastedTransactions, (transaction) => transaction.value < 0);

        return filter(
            map(spentAddressDataWithBalance, (addreessObject) =>
                assign({}, addreessObject, {
                    bundleHashes: map(
                        filter(inputTransactions, (transaction) => transaction.address === addreessObject.address),
                        (transaction) => transaction.bundle,
                    ),
                }),
            ),
            (addressObject) => !isEmpty(addressObject.bundleHashes),
        );
    }

    /**
     *
     * @param {array} addressData - Result of #getAddressData
     */
    async sweep(addressData) {
        const { accountName, accountMeta, password } = this.props;
        const seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);

        this.props.recoverLockedFunds(accountName, seedStore, addressData);
    }

    render() {
        const { latestAddress, t } = this.props;

        const addressData = this.getAddressData();

        return (
            <form>
                <section>
                    <h1>{t('sweeps:transferYourFunds')}</h1>
                    <p>{t('sweeps:transferYourFundsExplanation')}</p>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {addressData.map((object, index) => (
                            <div
                                key={index}
                                style={{
                                    marginBottom: '20px',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <strong>{`Sweep ${index + 1} of ${addressData.length}`}</strong>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                    }}
                                >
                                    <span>
                                        <strong>2 Mi </strong> from the locked address{' '}
                                        <strong title={object.inputAddress}>
                                            {object.address.slice(0, 9)} ... {object.address.slice(-3)}
                                        </strong>{' '}
                                        to the safe address{' '}
                                        <strong title={object.outputAddress}>
                                            {latestAddress.slice(0, 9)} ... {latestAddress.slice(-3)}
                                        </strong>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                <footer>
                    <Button
                        id="sweep-funds-complete"
                        onClick={() => this.sweep(addressData)}
                        className="square"
                        variant="primary"
                    >
                        {t('continue')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    accountName: getSelectedAccountName(state),
    accountMeta: getSelectedAccountMeta(state),
    spentAddressDataWithBalance: getSpentAddressDataWithBalanceForSelectedAccount(state),
    broadcastedTransactions: getBroadcastedTransactionsForSelectedAccount(state),
    latestAddress: selectLatestAddressFromAccountFactory()(state),
    sweepsStatuses: state.wallet.sweepsStatuses,
    password: state.wallet.password,
});

const mapDispatchToProps = {
    recoverLockedFunds,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(TransferFunds));
