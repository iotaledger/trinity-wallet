import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import { formatValue, formatUnit, round } from 'libs/util';
import { convertFromTrytes } from 'libs/iota';
import { formatTime, formatModalTime, convertUnixTimeToJSDate } from 'libs/dateUtils';
import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Clipboard from 'ui/components/Clipboard';

import css from './HistoryList.css';

class HistoryList extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        limit: PropTypes.number,
        inline: PropTypes.bool,
        filter: PropTypes.oneOf(['sent', 'received', 'pending']),
        transfers: PropTypes.array.isRequired,
        addresses: PropTypes.array.isRequired,
    };

    state = {
        activeItem: null,
    };

    setHistoryItem = (itemIndex) => {
        this.setState({
            activeItem: itemIndex,
        });
    };

    inlineItem = (transfer, isReceived, isConfirmed) => {
        return (
            <div>
                <span>{formatTime(convertUnixTimeToJSDate(transfer.timestamp))}</span>
                <strong>{!isConfirmed ? 'Pending' : isReceived ? 'Received' : 'Sent'}</strong>
                <span>{`${round(formatValue(transfer.value))} ${formatUnit(transfer.value)}`}</span>
            </div>
        );
    };

    fullItem = (transfer, isReceived, isConfirmed) => {
        return (
            <div className={css.full}>
                <p>
                    <span>
                        {isReceived ? 'Receive' : 'Send'}{' '}
                        {`${round(formatValue(transfer.value))} ${formatUnit(transfer.value)}`}
                    </span>
                    <strong>{!isConfirmed ? 'Pending' : isReceived ? 'Received' : 'Sent'}</strong>
                </p>
                <p>
                    <span>Message: {convertFromTrytes(transfer.signatureMessageFragment)}</span>
                    <span>{formatModalTime(convertUnixTimeToJSDate(transfer.timestamp))}</span>
                </p>
            </div>
        );
    };

    render() {
        const { transfers, addresses, limit, t, inline, filter } = this.props;

        const transferLimit = limit ? limit : transfers.length;

        const activeTransfers = this.state.activeItem !== null ? transfers[this.state.activeItem] : null;
        const activeTransfer = activeTransfers ? activeTransfers[0] : null;

        return (
            <div>
                <nav className={classNames(css.historyList, inline ? css.inline : null)}>
                    {transfers && transfers.length ? (
                        transfers.slice(0, transferLimit).map((transferRow, key) => {
                            const transfer = transferRow[0];
                            const isReceived = addresses.includes(transfer.address);
                            const isConfirmed = transfer.persistence;

                            if (
                                (filter === 'sent' && isReceived) ||
                                (filter === 'received' && !isReceived) ||
                                (filter === 'pending' && !isConfirmed)
                            ) {
                                return null;
                            }

                            return (
                                <a
                                    key={key}
                                    onClick={() => this.setHistoryItem(key)}
                                    className={classNames(
                                        isReceived ? css.received : css.sent,
                                        isConfirmed ? css.confirmed : css.pending,
                                    )}
                                >
                                    {inline
                                        ? this.inlineItem(transfer, isReceived, isConfirmed)
                                        : this.fullItem(transfer, isReceived, isConfirmed)}
                                </a>
                            );
                        })
                    ) : (
                        <a className={css.empty}>No recent history</a>
                    )}
                </nav>
                {activeTransfer !== null ? (
                    <Modal isOpen onClose={() => this.setState({ activeItem: null })}>
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
                                            ? 'Pending'
                                            : addresses.includes(activeTransfer.address) ? 'Received' : 'Sent'}
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
                                <Button onClick={() => this.setState({ activeItem: null })} variant="primary">
                                    {t('global:back')}
                                </Button>
                            </footer>
                        </div>
                    </Modal>
                ) : null}
            </div>
        );
    }
}

export default translate('historyList')(HistoryList);
