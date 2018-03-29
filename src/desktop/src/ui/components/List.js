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

        const activeTransfers = currentItem ? transfers[parseInt(currentItem)] : null;
        const activeTransfer = activeTransfers ? activeTransfers[0] : null;

        const formattedTx =
            transfers && transfers.length ? transfers.map((transfer) => getRelevantTransfer(transfer, addresses)) : [];
        const historyTx = orderBy(formattedTx, 'timestamp', ['desc']);

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
                                    onClick={() => setItem(key)}
                                    className={classNames(
                                        isReceived ? css.received : css.sent,
                                        isConfirmed ? css.confirmed : css.pending,
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
                {activeTransfer !== null ? (
                    <Modal isOpen onClose={() => setItem(null)}>
                        <div className={css.historyItem}>
                            <header
                                className={classNames(
                                    addresses.includes(activeTransfer.address) ? css.received : css.sent,
                                    activeTransfer.persistence ? css.confirmed : css.pending,
                                )}
                            >
                                <p>
                                    <strong>
                                        {!activeTransfer.persistence
                                            ? t('pending')
                                            : addresses.includes(activeTransfer.address) ? t('received') : t('sent')}
                                    </strong>{' '}
                                    <span>{`${round(formatValue(activeTransfer.value))} ${formatUnit(
                                        activeTransfer.value,
                                    )}`}</span>
                                </p>
                                <small>{formatModalTime(convertUnixTimeToJSDate(activeTransfer.timestamp))}</small>
                            </header>
                            <h6>Bundle Hash:</h6>
                            <p>
                                <Clipboard
                                    text={activeTransfer.bundle}
                                    title={t('history:bundleHashCopied')}
                                    success={t('history:bundleHashCopiedExplanation')}
                                />
                            </p>
                            <h6>Addresses</h6>
                            <div className={css.scroll}>
                                <ul>
                                    {activeTransfers.map((tx, key) => {
                                        return (
                                            <li key={key}>
                                                <p>
                                                    <Clipboard
                                                        text={tx.address}
                                                        title={t('history:addressCopied')}
                                                        success={t('history:addressCopiedExplanation')}
                                                    />
                                                </p>
                                                <strong>{`${round(formatValue(tx.value))} ${formatUnit(
                                                    tx.value,
                                                )}`}</strong>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <h6>Message</h6>
                            <p>{convertFromTrytes(activeTransfer.signatureMessageFragment)}</p>
                            <footer>
                                <Button onClick={() => setItem(null)} variant="primary">
                                    {t('back')}
                                </Button>
                            </footer>
                        </div>
                    </Modal>
                ) : null}
            </React.Fragment>
        );
    }
}

export default withListData(List);
