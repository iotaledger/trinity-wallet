import React from 'react';
import PropTypes from 'prop-types';
import orderBy from 'lodash/orderBy';
import classNames from 'classnames';
import { formatValue, formatUnit, round } from 'libs/util';
import { convertFromTrytes } from 'libs/iota/utils';
import { formatTime, formatModalTime, convertUnixTimeToJSDate } from 'libs/dateUtils';
import { getRelevantTransfer } from 'libs/iota/transfers';
import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Clipboard from 'ui/components/Clipboard';
import Icon from 'ui/components/Icon';

import withListData from 'containers/components/List';

import css from './list.css';

/**
 * Transaction history list component
 */
class List extends React.PureComponent {
    static propTypes = {
        /** Can history be updated */
        isBusy: PropTypes.bool.isRequired,
        /** Is history updating */
        isLoading: PropTypes.bool.isRequired,
        /** Should update history */
        updateAccount: PropTypes.func.isRequired,
        /** Transaction history */
        transfers: PropTypes.array.isRequired,
        /** Set active history item
         * @param {Number} index - Current item index
         */
        setItem: PropTypes.func.isRequired,
        /** Current active history item */
        currentItem: PropTypes.number,
        /** Receive address list */
        addresses: PropTypes.array.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        filter: 'All',
    };

    switchFilter(filter) {
        this.setState({
            filter: filter,
        });
    }

    render() {
        const { isLoading, isBusy, updateAccount, transfers, addresses, setItem, currentItem, t } = this.props;
        const { filter } = this.state;

        const filters = ['All', 'Sent', 'Received', 'Pending'];

        const formattedTx =
            transfers && transfers.length ? transfers.map((transfer) => getRelevantTransfer(transfer, addresses)) : [];
        const historyTx = orderBy(formattedTx, 'timestamp', ['desc']);

        const activeTransfer = currentItem ? historyTx.filter((tx) => tx.hash === currentItem)[0] : null;

        return (
            <React.Fragment>
                <nav className={css.nav}>
                    {filters.map((item) => {
                        return (
                            <a
                                key={item}
                                onClick={() => this.switchFilter(item)}
                                className={classNames(
                                    filter === item ? css.active : null,
                                    !transfers || !transfers.length ? css.disabled : null,
                                )}
                            >
                                {item}
                            </a>
                        );
                    })}
                    <a
                        onClick={() => updateAccount()}
                        className={classNames(css.refresh, isBusy ? css.busy : null, isLoading ? css.loading : null)}
                    >
                        <Icon icon="sync" size={32} />
                    </a>
                </nav>
                <hr />
                <div className={css.list}>
                    {historyTx && historyTx.length ? (
                        historyTx.map((transfer, key) => {
                            const isReceived = addresses.includes(transfer.address);
                            const isConfirmed = transfer.persistence;

                            if (
                                (filter === 'Sent' && isReceived) ||
                                (filter === 'Received' && !isReceived) ||
                                (filter === 'Pending' && isConfirmed)
                            ) {
                                return null;
                            }

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
                                        <Icon icon={isReceived ? 'receive' : 'send'} size={16} />
                                        <span>{formatTime(convertUnixTimeToJSDate(transfer.timestamp))}</span>
                                        <strong>
                                            {!isConfirmed ? t('pending') : isReceived ? t('received') : t('sent')}
                                        </strong>
                                        <span>{`${round(formatValue(transfer.value))} ${formatUnit(
                                            transfer.value,
                                        )}`}</span>
                                    </div>
                                </a>
                            );
                        })
                    ) : (
                        <p className={css.empty}>No recent history</p>
                    )}
                </div>
                <div className={classNames(css.popup, activeTransfer ? css.on : null)} onClick={() => setItem(null)}>
                    <div>
                        {activeTransfer ? (
                            <div
                                className={classNames(
                                    addresses.includes(activeTransfer.address) ? css.received : css.sent,
                                    activeTransfer.persistence ? css.confirmed : css.pending,
                                )}
                            >
                                <p>
                                    <strong>
                                        {addresses.includes(activeTransfer.address)
                                            ? t('history:receive')
                                            : t('history:send')}
                                        <span>
                                            {' '}
                                            {`${round(formatValue(activeTransfer.value))} ${formatUnit(
                                                activeTransfer.value,
                                            )}`}
                                        </span>
                                    </strong>
                                    <small>
                                        {!activeTransfer.persistence
                                            ? t('pending')
                                            : addresses.includes(activeTransfer.address) ? t('received') : t('sent')}
                                        <em>{formatModalTime(convertUnixTimeToJSDate(activeTransfer.timestamp))}</em>
                                    </small>
                                </p>
                                <h6>Bundle Hash:</h6>
                                <p className={css.hash}>
                                    <Clipboard
                                        text={activeTransfer.bundle}
                                        title={t('history:bundleHashCopied')}
                                        success={t('history:bundleHashCopiedExplanation')}
                                    />
                                </p>
                                <p>
                                    <strong>{t('send:message')}</strong>
                                    <span>{convertFromTrytes(activeTransfer.signatureMessageFragment)}</span>
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default withListData(List);
