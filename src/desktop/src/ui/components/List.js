import React from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import classNames from 'classnames';

import { formatValue, formatUnit } from 'libs/iota/utils';
import { round } from 'libs/utils';
import { formatTime, formatModalTime, convertUnixTimeToJSDate } from 'libs/date';
import { getPoWFn } from 'libs/pow';

import Clipboard from 'ui/components/Clipboard';
import Icon from 'ui/components/Icon';
import Scrollbar from 'ui/components/Scrollbar';
import Button from 'ui/components/Button';

import withListData from 'containers/components/List';

import css from './list.scss';

/**
 * Transaction history list component
 */
class List extends React.PureComponent {
    static propTypes = {
        /** Can history be updated */
        isBusy: PropTypes.bool.isRequired,
        /** Wallet mode */
        mode: PropTypes.string.isRequired,
        /** Is remote PoW enabled */
        remotePoW: PropTypes.bool.isRequired,
        /** Is history updating */
        isLoading: PropTypes.bool.isRequired,
        /** Bundle hash for the transaction that is currently being promoted */
        currentlyPromotingBundleHash: PropTypes.string.isRequired,
        /** Determines if wallet is broadcasting bundle */
        isBroadcastingBundle: PropTypes.bool.isRequired,
        /** Current transaction retry state */
        isRetryingFailedTransaction: PropTypes.bool.isRequired,
        /** Hide empty transactions flag */
        hideEmptyTransactions: PropTypes.bool.isRequired,
        /** Should update history */
        updateAccount: PropTypes.func.isRequired,
        /** Toggle hide empty transactions */
        toggleEmptyTransactions: PropTypes.func.isRequired,
        /** Transaction history */
        transfers: PropTypes.object.isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        failedHashes: PropTypes.object.isRequired,
        /** Promotes bundle
         * @param {string} bundle - bundle hash
         * @param {func} powFn - local Proof of Work function
         */
        promoteTransaction: PropTypes.func.isRequired,
        /** Broadcast bundle
         * @param {string} bundle - bundle hash
         */
        broadcastBundle: PropTypes.func.isRequired,
        /** Retry failed bundle
         * @param {string} bundle - bundle hash
         * @param {func} powFn - local Proof of Work function
         */
        retryFailedTransaction: PropTypes.func.isRequired,
        /** Set active history item
         * @param {Number} index - Current item index
         */
        setItem: PropTypes.func.isRequired,
        /** Current active history item */
        currentItem: PropTypes.string,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
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
                        return (
                            <p key={`${index}-${input.address}`}>
                                <span>
                                    <Clipboard
                                        text={`${input.address}${input.checksum}`}
                                        title={t('history:addressCopied')}
                                        success={t('history:addressCopiedExplanation')}
                                    />
                                </span>
                                <em>
                                    {round(formatValue(input.value), 1)}
                                    {formatUnit(input.value)}
                                </em>
                            </p>
                        );
                    })}
                </Scrollbar>
            </div>
        );
    }

    promoteTransaction(e, bundle) {
        e.stopPropagation();

        const { generateAlert, t } = this.props;

        let powFn = null;

        if (!this.props.remotePoW) {
            try {
                powFn = getPoWFn();
            } catch (e) {
                return generateAlert('error', t('pow:noWebGLSupport'), t('pow:noWebGLSupportExplanation'));
            }
        }

        this.props.promoteTransaction(bundle, powFn);
    }

    retryFailedTransaction(e, bundle) {
        e.stopPropagation();

        const { generateAlert, t } = this.props;

        let powFn = null;

        if (!this.props.remotePoW) {
            try {
                powFn = getPoWFn();
            } catch (e) {
                return generateAlert('error', t('pow:noWebGLSupport'), t('pow:noWebGLSupportExplanation'));
            }
        }

        this.props.retryFailedTransaction(bundle, powFn);
    }

    broadcastBundle(e, bundle) {
        e.stopPropagation();
        this.props.broadcastBundle(bundle);
    }

    render() {
        const {
            isLoading,
            isBusy,
            currentlyPromotingBundleHash,
            isBroadcastingBundle,
            isRetryingFailedTransaction,
            mode,
            hideEmptyTransactions,
            toggleEmptyTransactions,
            updateAccount,
            transfers,
            failedHashes,
            setItem,
            currentItem,
            t,
        } = this.props;
        const { filter, loaded, search } = this.state;

        const filters = ['All', 'Sent', 'Received', 'Pending'];
        const transfersList = map(transfers, (tx) => tx);

        const totals = {
            All: 0,
            Sent: 0,
            Received: 0,
            Pending: 0,
        };

        const historyTx = orderBy(transfersList, 'timestamp', ['desc']).filter((transfer) => {
            const isReceived = transfer.incoming;
            const isConfirmed = transfer.persistence;

            if (hideEmptyTransactions && transfer.transferValue === 0) {
                return false;
            }

            if (
                transfer.message.toLowerCase().indexOf(search) < 0 &&
                transfer.bundle !== search &&
                transfer.hash !== search &&
                (!/^\+?\d+$/.test(search) || transfer.transferValue < parseInt(search))
            ) {
                return false;
            }

            totals.All++;

            if (!isConfirmed) {
                totals.Pending++;
                if (filter === 'Pending') {
                    return true;
                }
            } else if (isReceived) {
                totals.Received++;
                if (filter === 'Received') {
                    return true;
                }
            } else {
                totals.Sent++;
                if (filter === 'Sent') {
                    return true;
                }
            }

            return filter === 'All';
        });

        const failedBundles = Object.keys(failedHashes);

        const activeTransfer = currentItem ? historyTx.filter((tx) => tx.hash === currentItem)[0] : null;
        const isActiveFailed = activeTransfer && failedBundles.indexOf(activeTransfer.bundle) > -1;

        return (
            <React.Fragment>
                <nav className={css.nav}>
                    <ul>
                        <a key="active" onClick={() => this.switchFilter(filter)}>
                            {filter === 'All' ? 'All' : t(filter.toLowerCase())} <small>({historyTx.length})</small>
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
                                            {item === 'All' ? 'All' : t(item.toLowerCase())} ({totals[item]})
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
                            onChange={(e) => this.setState({ search: e.target.value })}
                        />
                        <Icon icon="search" size={20} />
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
                        {historyTx && historyTx.length ? (
                            historyTx.map((transfer, key) => {
                                const isReceived = transfer.incoming;
                                const isConfirmed = transfer.persistence;

                                return (
                                    <a
                                        key={key}
                                        onClick={() => setItem(transfer.hash)}
                                        className={classNames(
                                            isConfirmed ? css.confirmed : css.pending,
                                            isReceived ? css.received : css.sent,
                                        )}
                                    >
                                        <div>
                                            <div className={isReceived ? css.plus : css.minus} />
                                            <span>
                                                {formatTime(
                                                    navigator.language,
                                                    convertUnixTimeToJSDate(transfer.timestamp),
                                                )}
                                            </span>
                                            <span>
                                                {!isConfirmed ? t('pending') : isReceived ? t('received') : t('sent')}
                                            </span>
                                            <span>
                                                {round(formatValue(transfer.transferValue), 1)}{' '}
                                                {formatUnit(transfer.transferValue)}
                                            </span>
                                        </div>
                                    </a>
                                );
                            })
                        ) : (
                            <p className={css.empty}>
                                {!transfersList.length ? t('noTransactions') : t('history:noTransactionsFound')}
                            </p>
                        )}
                    </Scrollbar>
                </div>
                <div className={classNames(css.popup, activeTransfer ? css.on : null)} onClick={() => setItem(null)}>
                    <div>
                        {activeTransfer ? (
                            <div
                                className={classNames(
                                    activeTransfer.incoming ? css.received : css.sent,
                                    activeTransfer.persistence ? css.confirmed : css.pending,
                                )}
                            >
                                <p>
                                    <strong>
                                        {activeTransfer.incoming ? t('history:receive') : t('history:send')}{' '}
                                        <span>
                                            {round(formatValue(activeTransfer.transferValue), 1)}{' '}
                                            {formatUnit(activeTransfer.transferValue)}
                                        </span>
                                    </strong>
                                    <small>
                                        {!activeTransfer.persistence
                                            ? t('pending')
                                            : activeTransfer.incoming ? t('received') : t('sent')}
                                        <em>
                                            {formatModalTime(
                                                navigator.language,
                                                convertUnixTimeToJSDate(activeTransfer.timestamp),
                                            )}
                                        </em>
                                    </small>
                                </p>
                                <h6>{t('bundleHash')}:</h6>
                                <p className={css.hash}>
                                    <Clipboard
                                        text={activeTransfer.bundle}
                                        title={t('history:bundleHashCopied')}
                                        success={t('history:bundleHashCopiedExplanation')}
                                    />
                                </p>
                                {mode === 'Expert' && this.listAddresses(activeTransfer)}
                                <div className={css.message}>
                                    <strong>{t('send:message')}</strong>
                                    <Scrollbar>
                                        <Clipboard
                                            text={activeTransfer.message}
                                            title={t('history:messageCopied')}
                                            success={t('history:messageCopiedExplanation')}
                                        />
                                    </Scrollbar>
                                </div>
                                {!activeTransfer.persistence && (
                                    <nav>
                                        {isActiveFailed && (
                                            <Button
                                                className="small"
                                                loading={isRetryingFailedTransaction}
                                                onClick={(e) => this.retryFailedTransaction(e, activeTransfer.bundle)}
                                            >
                                                {t('retry')}
                                            </Button>
                                        )}
                                        {!isActiveFailed && (
                                            <Button
                                                className="small"
                                                loading={currentlyPromotingBundleHash === activeTransfer.bundle}
                                                onClick={(e) => this.promoteTransaction(e, activeTransfer.bundle)}
                                            >
                                                {t('retry')}
                                            </Button>
                                        )}
                                        {!isActiveFailed &&
                                            mode === 'Expert' && (
                                                <Button
                                                    variant="secondary"
                                                    className="small"
                                                    loading={isBroadcastingBundle}
                                                    onClick={(e) => this.broadcastBundle(e, activeTransfer.bundle)}
                                                >
                                                    {t('rebroadcast')}
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

export default withListData(List);
