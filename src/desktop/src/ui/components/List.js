import React from 'react';
import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { iota } from 'libs/iota';
import { formatIotas } from 'libs/iota/utils';
import { filterTransactions } from 'libs/iota/transfers';
import { formatModalTime, convertUnixTimeToJSDate, detectedTimezone } from 'libs/date';
import SeedStore from 'libs/SeedStore';

import Clipboard from 'ui/components/Clipboard';
import Icon from 'ui/components/Icon';
import Scrollbar from 'ui/components/Scrollbar';
import Button from 'ui/components/Button';
import TransactionRow from 'ui/components/Transaction';

import withListData from 'containers/components/List';

import css from './list.scss';

/**
 * Transaction history list component
 */
export class ListComponent extends React.PureComponent {
    static propTypes = {
        /** Can history be updated */
        isBusy: PropTypes.bool.isRequired,
        /** Wallet mode */
        mode: PropTypes.string.isRequired,
        /** Is history updating */
        isLoading: PropTypes.bool.isRequired,
        /** Bundle hash for the transaction that is currently being promoted */
        currentlyPromotingBundleHash: PropTypes.string.isRequired,
        /** Current transaction retry state */
        isRetryingFailedTransaction: PropTypes.bool.isRequired,
        /** Hide empty transactions flag */
        hideEmptyTransactions: PropTypes.bool.isRequired,
        /** Should update history */
        updateAccount: PropTypes.func,
        /** Toggle hide empty transactions */
        toggleEmptyTransactions: PropTypes.func.isRequired,
        /** Transaction history */
        transactions: PropTypes.array.isRequired,
        /** Promotes bundle
         * @param {string} bundle - bundle hash
         * @param {object} seedStore
         */
        promoteTransaction: PropTypes.func.isRequired,
        /** Retry failed bundle
         * @param {string} bundle - bundle hash
         * @param {object} seedStore
         */
        retryFailedTransaction: PropTypes.func.isRequired,
        /** Set active history item
         * @param {number} index - Current item index
         */
        setItem: PropTypes.func.isRequired,
        /** Current active history item */
        currentItem: PropTypes.string,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
        /** @ignore */
        accountMeta: PropTypes.object.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** Determines if list is being rendered for Tray app */
        isRenderingForTray: PropTypes.bool.isRequired,
    };

    state = {
        filter: 'All',
        search: '',
        loaded: true,
    };

    switchFilter(filter) {
        if (filter === this.state.filter) {
            return;
        }

        this.setState({
            filter: filter,
            loaded: false,
        });
        setTimeout(() => {
            this.setState({
                loaded: true,
            });
        }, 200);
    }

    listAddresses(tx) {
        const { t } = this.props;

        return (
            <div className={css.addresses}>
                <strong>{t('addresses')}:</strong>
                <Scrollbar>
                    {tx.inputs.concat(tx.outputs).map((input, index) => {
                        const checksum = iota.utils.addChecksum(input.address).slice(input.address.length);

                        return (
                            <p key={`${index}-${input.address}`}>
                                <span>
                                    <Clipboard
                                        text={`${input.address}${checksum}`}
                                        title={t('history:addressCopied')}
                                        success={t('history:addressCopiedExplanation')}
                                        address
                                    >
                                        {input.address}
                                        <mark>{checksum}</mark>
                                    </Clipboard>
                                </span>
                                <em>{formatIotas(input.value, true, true)}</em>
                            </p>
                        );
                    })}
                </Scrollbar>
            </div>
        );
    }

    async promoteTransaction(e, bundle) {
        e.stopPropagation();

        const { accountMeta, password } = this.props;
        const seedStore = await new SeedStore[accountMeta.type](password);

        this.props.promoteTransaction(bundle, seedStore);
    }

    async retryFailedTransaction(e, bundle) {
        e.stopPropagation();

        const { accountMeta, password } = this.props;
        const seedStore = await new SeedStore[accountMeta.type](password);

        this.props.retryFailedTransaction(bundle, seedStore);
    }

    render() {
        const {
            isLoading,
            isBusy,
            currentlyPromotingBundleHash,
            isRetryingFailedTransaction,
            mode,
            hideEmptyTransactions,
            isRenderingForTray,
            toggleEmptyTransactions,
            updateAccount,
            transactions,
            setItem,
            currentItem,
            t,
        } = this.props;
        const { filter, loaded, search } = this.state;

        const filters = ['All', 'Sent', 'Received', 'Pending'];

        const { filteredTransactions, totals } = filterTransactions(
            orderBy(transactions, 'timestamp', ['desc']),
            isRenderingForTray || hideEmptyTransactions,
            filter,
            search,
        );
        const activeTx = currentItem ? filteredTransactions.filter((tx) => tx.bundle === currentItem)[0] : null;
        const isActiveFailed = activeTx && activeTx.broadcasted === false;

        return (
            <React.Fragment>
                <nav className={css.nav}>
                    <ul>
                        <a key="active" onClick={() => this.switchFilter(filter)}>
                            {t(filter.toLowerCase())} <small>({filteredTransactions.length})</small>
                            <Icon icon="chevronDown" size={8} />
                        </a>
                        {loaded ? (
                            <li>
                                {filters.map((item) => {
                                    return (
                                        <a
                                            key={item}
                                            onClick={() => this.switchFilter(item)}
                                            className={classNames(
                                                totals[item] === 0 ? css.disabled : filter === item ? css.active : null,
                                            )}
                                        >
                                            {item === 'All' ? t('global:all') : t(item.toLowerCase())} ({totals[item]})
                                        </a>
                                    );
                                })}

                                <div>
                                    <a
                                        className={classNames(css.checkbox, hideEmptyTransactions ? css.on : css.off)}
                                        onClick={() => toggleEmptyTransactions()}
                                    >
                                        {t('history:hideZeroBalance')}
                                    </a>
                                </div>
                            </li>
                        ) : null}
                    </ul>
                    <div className={css.search}>
                        <input
                            className={search.length > 0 ? css.filled : null}
                            value={search}
                            placeholder={t('history:typeHelp')}
                            onChange={(e) => this.setState({ search: e.target.value })}
                        />
                        <div onClick={() => this.setState({ search: '' })}>
                            <Icon icon={search.length > 0 ? 'cross' : 'search'} size={search.length > 0 ? 16 : 20} />
                            {search === '!help' && (
                                <ul className={css.tooltip}>
                                    <li>
                                        <strong>XYZ</strong> {t('history:searchHelpText')}
                                    </li>
                                    <li>
                                        <strong>100</strong> {t('history:searchHelpValue')}
                                    </li>
                                    <li>
                                        <strong>100Mi</strong> {t('history:searchHelpUnits')}
                                    </li>
                                    <li>
                                        <strong>&gt;100 </strong> {t('history:searchHelpMore')}
                                    </li>
                                    <li>
                                        <strong>&lt;100i</strong> {t('history:searchHelpLess')}
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>
                    <a
                        onClick={() => updateAccount()}
                        className={classNames(css.refresh, isBusy ? css.busy : null, isLoading ? css.loading : null)}
                    >
                        <Icon icon="sync" size={24} />
                    </a>
                </nav>
                <hr />
                <div className={css.list}>
                    <Scrollbar>
                        {filteredTransactions.length ? (
                            <AutoSizer>
                                {({ height, width }) => (
                                    <FixedSizeList
                                        height={height}
                                        itemCount={filteredTransactions.length}
                                        itemSize={30}
                                        width={width}
                                        itemData={filteredTransactions.map((tx) => ({ ...tx, t, setItem }))}
                                        className={css.scrollbar}
                                    >
                                        {TransactionRow}
                                    </FixedSizeList>
                                )}
                            </AutoSizer>
                        ) : (
                            <p className={css.empty}>
                                {!filteredTransactions.length ? t('noTransactions') : t('history:noTransactionsFound')}
                            </p>
                        )}
                    </Scrollbar>
                </div>
                <div className={classNames(css.popup, activeTx ? css.on : null)} onClick={() => setItem(null)}>
                    <div>
                        {activeTx ? (
                            <div
                                className={classNames(
                                    activeTx.incoming ? css.received : css.sent,
                                    activeTx.persistence ? css.confirmed : css.pending,
                                )}
                            >
                                <p>
                                    <strong>
                                        {activeTx.incoming ? t('history:receive') : t('history:send')}{' '}
                                        <span>{formatIotas(activeTx.transferValue, false, true)}</span>
                                    </strong>
                                    <small>
                                        {!activeTx.persistence
                                            ? t('pending')
                                            : activeTx.incoming
                                            ? t('received')
                                            : t('sent')}
                                        <em>
                                            {formatModalTime(
                                                navigator.language,
                                                detectedTimezone,
                                                convertUnixTimeToJSDate(activeTx.timestamp),
                                            )}
                                        </em>
                                    </small>
                                </p>
                                <h6>{t('bundleHash')}:</h6>
                                <p className={css.hash}>
                                    <Clipboard
                                        text={activeTx.bundle}
                                        title={t('history:bundleHashCopied')}
                                        success={t('history:bundleHashCopiedExplanation')}
                                    />
                                </p>
                                {mode === 'Advanced' && this.listAddresses(activeTx)}
                                <div className={css.message}>
                                    <strong>{t('send:message')}:</strong>
                                    <Scrollbar>
                                        <Clipboard
                                            text={activeTx.message === 'Empty' ? t('history:empty') : activeTx.message}
                                            title={t('history:messageCopied')}
                                            success={t('history:messageCopiedExplanation')}
                                        />
                                    </Scrollbar>
                                </div>
                                {!activeTx.persistence && (
                                    <nav>
                                        {isActiveFailed && (
                                            <Button
                                                className="small"
                                                loading={isRetryingFailedTransaction}
                                                onClick={(e) => this.retryFailedTransaction(e, activeTx.bundle)}
                                            >
                                                {t('retry')}
                                            </Button>
                                        )}
                                        {!isActiveFailed && (
                                            <Button
                                                className="small"
                                                loading={currentlyPromotingBundleHash === activeTx.bundle}
                                                onClick={(e) => this.promoteTransaction(e, activeTx.bundle)}
                                            >
                                                {t('retry')}
                                            </Button>
                                        )}
                                    </nav>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default withTranslation()(withListData(ListComponent));
