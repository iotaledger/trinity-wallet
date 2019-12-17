import merge from 'lodash/merge';
import orderBy from 'lodash/orderBy';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';

import { round } from 'libs/utils';
import { formatValue, unitStringToValue } from 'libs/iota/utils';
import { formatModalTime, formatTime, detectedTimezone } from 'libs/date';
import { getPurchaseFailureReason, convertFiatToMiota } from 'exchanges/MoonPay/utils';
import { MOONPAY_TRANSACTION_STATUSES, SHORT_IOTA_CURRENCY_CODE } from 'exchanges/MoonPay';
import { getCurrencySymbol } from 'libs/currency';

import Clipboard from 'ui/components/Clipboard';
import Icon from 'ui/components/Icon';
import Scrollbar from 'ui/components/Scrollbar';
import Button from 'ui/components/Button';

import withPurchaseListData from 'containers/components/PurchaseList';

import css from '../../list.scss';

/**
 * Purchase history list component
 */
export class PurchaseListComponent extends React.PureComponent {
    static propTypes = {
        /** Can history be updated */
        isBusy: PropTypes.bool.isRequired,
        /** Is fetching latest purchase history */
        isLoading: PropTypes.bool.isRequired,
        /** Purchase history */
        purchaseHistory: PropTypes.array.isRequired,
        /** @ignore */
        exchangeRates: PropTypes.object.isRequired,
        /** Set active history item */
        setItem: PropTypes.func.isRequired,
        /** Current active history item */
        currentItem: PropTypes.string,
        /** Fetch latest purchase history */
        fetchPurchaseHistory: PropTypes.func.isRequired,
        /** @ignore */
        updateMoonPayTransactionDetails: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        filter: 'all',
        search: '',
        loaded: true,
    };

    /**
     * Changes active filter
     *
     * @method switchFilter
     *
     * @param {string} filter
     */
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

    render() {
        const {
            exchangeRates,
            isLoading,
            isBusy,
            purchaseHistory,
            setItem,
            currentItem,
            fetchPurchaseHistory,
            t,
        } = this.props;
        const { filter, loaded, search } = this.state;

        const totals = {
            all: 0,
            pending: 0,
            completed: 0,
            failed: 0,
            waitingAuthorization: 0,
        };

        const filters = Object.keys(totals);

        const _getAmount = (purchase) =>
            purchase.quoteCurrencyAmount ||
            // quoteCurrencyAmount is set to null for failed transactions,
            // Hence compute it locally
            convertFiatToMiota(purchase.baseCurrencyAmount, purchase.currencyCode, exchangeRates);

        const filteredPurchases = orderBy(purchaseHistory, 'createdAt', ['desc']).filter((purchase) => {
            const amount = _getAmount(purchase);

            if (
                search.length &&
                purchase.cryptoTransactionId &&
                purchase.cryptoTransactionId.toLowerCase().indexOf(search.toLowerCase()) !== 0 &&
                !(search[0] === '>' && unitStringToValue(search.substr(1)) < amount) &&
                !(search[0] === '<' && unitStringToValue(search.substr(1)) > amount) &&
                amount !== unitStringToValue(search)
            ) {
                return false;
            }

            totals.all++;

            if (purchase.status === MOONPAY_TRANSACTION_STATUSES.pending) {
                totals.pending++;

                if (filter === 'pending') {
                    return true;
                }
            } else if (purchase.status === MOONPAY_TRANSACTION_STATUSES.completed) {
                totals.completed++;
                if (filter === 'completed') {
                    return true;
                }
            } else if (purchase.status === MOONPAY_TRANSACTION_STATUSES.failed) {
                totals.failed++;
                if (filter === 'failed') {
                    return true;
                }
            } else {
                totals.waitingAuthorization++;
                if (filter === 'waitingAuthorization') {
                    return true;
                }
            }

            return filter === 'all';
        });

        const activePurchase = currentItem
            ? filteredPurchases.filter((purchase) => purchase.id === currentItem)[0]
            : null;

        return (
            <React.Fragment>
                <nav className={css.nav}>
                    <ul>
                        <a key="active" onClick={() => this.switchFilter(filter)}>
                            {filter === 'all' ? t('global:all') : t(`moonpay:${filter}`)}{' '}
                            <small>({filteredPurchases.length})</small>
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
                                            {item === 'all' ? t('global:all') : t(`moonpay:${item}`)} ({totals[item]})
                                        </a>
                                    );
                                })}
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
                                        <strong>&gt;100 </strong> {t('history:searchHelpMore')}
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>
                    <a
                        onClick={() => fetchPurchaseHistory()}
                        className={classNames(css.refresh, isBusy ? css.busy : null, isLoading ? css.loading : null)}
                    >
                        <Icon icon="sync" size={24} />
                    </a>
                </nav>
                <hr />
                <div className={css.list}>
                    <Scrollbar>
                        {filteredPurchases.length ? (
                            filteredPurchases.map((purchase, key) => {
                                const amount = _getAmount(purchase);
                                const isPending = purchase.status === MOONPAY_TRANSACTION_STATUSES.pending;

                                return (
                                    <a
                                        key={key}
                                        onClick={() => setItem(purchase.id)}
                                        className={classNames(isPending ? css.pending : css.confirmed, css.received)}
                                    >
                                        <div>
                                            <Icon icon="moonpayEmblem" size={14} />
                                            <span>
                                                {formatTime(navigator.language, detectedTimezone, purchase.createdAt)}
                                            </span>
                                            <span>{t(`moonpay:${purchase.status}`)}</span>
                                            <span>
                                                {round(formatValue(amount), 1)} {SHORT_IOTA_CURRENCY_CODE}
                                            </span>
                                        </div>
                                    </a>
                                );
                            })
                        ) : (
                            <p className={css.empty}>{t('moonpay:emptyHistory')}</p>
                        )}
                    </Scrollbar>
                </div>
                <div className={classNames(css.popup, activePurchase ? css.on : null)} onClick={() => setItem(null)}>
                    <div>
                        {activePurchase ? (
                            <div
                                className={classNames(
                                    css.received,
                                    activePurchase.status === MOONPAY_TRANSACTION_STATUSES.completed
                                        ? css.confirmed
                                        : css.pending,
                                )}
                            >
                                <p>
                                    <strong>
                                        {t('moonpay:purchase')}{' '}
                                        <span>
                                            {round(formatValue(_getAmount(activePurchase)), 1)}{' '}
                                            {SHORT_IOTA_CURRENCY_CODE}
                                        </span>
                                    </strong>
                                    <small>
                                        {t(`moonpay:${activePurchase.status}`)}
                                        {activePurchase.failureReason &&
                                            ': ' + getPurchaseFailureReason(activePurchase.failureReason)}
                                        <em>
                                            {formatModalTime(
                                                navigator.language,
                                                detectedTimezone,
                                                activePurchase.createdAt,
                                            )}
                                        </em>
                                    </small>
                                </p>
                                <h6>{t('moonpay:purchaseAmount')}:</h6>
                                <p className={css.hash}>
                                    {getCurrencySymbol(activePurchase.currencyCode)}
                                    {(activePurchase.baseCurrencyAmount + activePurchase.feeAmount).toFixed(2)}
                                </p>
                                <h6>{t('bundleHash')}:</h6>
                                <p className={css.hash}>
                                    {activePurchase.cryptoTransactionId ? (
                                        <Clipboard
                                            text={activePurchase.cryptoTransactionId}
                                            title={t('history:bundleHashCopied')}
                                            success={t('history:bundleHashCopiedExplanation')}
                                        />
                                    ) : (
                                        t('moonpay:awaitingIOTATransaction')
                                    )}
                                </p>
                                <h6>{t('address')}:</h6>
                                <p className={css.hash}>
                                    <Clipboard
                                        text={activePurchase.walletAddress}
                                        title={t('history:addressCopied')}
                                        success={t('history:addressCopiedExplanation')}
                                    />
                                </p>
                                <h6>{t('moonpay:help')}</h6>
                                <p className={css.hash}>
                                    <a href="https://help.moonpay.io/">{t('moonpay:faq')}</a>
                                </p>
                                {activePurchase.status === MOONPAY_TRANSACTION_STATUSES.waitingAuthorization && (
                                    <nav>
                                        <Button
                                            className="small"
                                            onClick={() => {
                                                this.props.updateMoonPayTransactionDetails(
                                                    merge({}, activePurchase, { active: true }),
                                                );
                                                window.open(activePurchase.redirectUrl);
                                            }}
                                        >
                                            {t('moonpay:authorize')}
                                        </Button>
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

export default withTranslation()(withPurchaseListData(PurchaseListComponent));
