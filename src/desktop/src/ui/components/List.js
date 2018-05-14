import React from 'react';
import PropTypes from 'prop-types';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import classNames from 'classnames';
import { formatValue, formatUnit } from 'libs/iota/utils';
import { round } from 'libs/utils';
import { formatTime, formatModalTime, convertUnixTimeToJSDate } from 'libs/date';

import Clipboard from 'ui/components/Clipboard';
import Icon from 'ui/components/Icon';
import Scrollbar from 'ui/components/Scrollbar';

import withListData from 'containers/components/List';

import css from './list.scss';

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
        transfers: PropTypes.object.isRequired,
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

    render() {
        const { isLoading, isBusy, updateAccount, transfers, setItem, currentItem, t } = this.props;
        const { filter, loaded } = this.state;

        const filters = ['All', 'Sent', 'Received', 'Pending'];
        const transfersList = map(transfers, (tx) => tx);

        const formattedTx = transfersList.filter((tx) => {
            const isReceived = tx.incoming;
            const isConfirmed = tx.persistence;

            return !(
                (filter === 'Sent' && (isReceived || !isConfirmed)) ||
                (filter === 'Received' && (!isReceived || !isConfirmed)) ||
                (filter === 'Pending' && isConfirmed)
            );
        });

        const historyTx = orderBy(formattedTx, 'timestamp', ['desc']);

        const activeTransfer = currentItem ? historyTx.filter((tx) => tx.hash === currentItem)[0] : null;

        return (
            <React.Fragment>
                <nav className={css.nav}>
                    <ul>
                        <a key="active" onClick={() => this.switchFilter(filter)} className={classNames(css.active)}>
                            {filter === 'All' ? 'All' : t(filter.toLowerCase())} <small>({historyTx.length})</small>
                            <Icon icon="chevronDown" size={8} />
                        </a>
                        {loaded
                            ? filters.map((item) => {
                                  if (filter === item) {
                                      return null;
                                  }
                                  return (
                                      <a
                                          key={item}
                                          onClick={() => this.switchFilter(item)}
                                          className={classNames(filter === item ? css.active : null)}
                                      >
                                          {item === 'All' ? 'All' : t(item.toLowerCase())}
                                      </a>
                                  );
                              })
                            : null}
                    </ul>
                    <a
                        onClick={() => updateAccount()}
                        className={classNames(css.refresh, isBusy ? css.busy : null, isLoading ? css.loading : null)}
                    >
                        <Icon icon="sync" size={20} />
                    </a>
                </nav>
                <hr />
                <div className={css.list}>
                    <Scrollbar>
                        {historyTx && historyTx.length ? (
                            historyTx.map((transfer, key) => {
                                const isReceived = transfer.incoming;
                                const isConfirmed = transfer.persistence;

                                if (
                                    (filter === 'Sent' && (isReceived || !isConfirmed)) ||
                                    (filter === 'Received' && (!isReceived || !isConfirmed)) ||
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
                                            <div className={isReceived ? css.plus : css.minus} />
                                            <span>{formatTime(convertUnixTimeToJSDate(transfer.timestamp))}</span>
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
                            <p className={css.empty}>{t('noTransactions')}</p>
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
                                        <em>{formatModalTime(convertUnixTimeToJSDate(activeTransfer.timestamp))}</em>
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
                            </div>
                        ) : null}
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default withListData(List);
