import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import { formatValue, formatUnit, round } from 'libs/util';
import { formatModalTime, formatTime, convertUnixTimeToJSDate } from 'libs/dateUtils';

import css from './HistoryList.css';

class HistoryList extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        limit: PropTypes.number,
        transfers: PropTypes.array.isRequired,
        addresses: PropTypes.array.isRequired,
    };

    render() {
        const { transfers, addresses, limit } = this.props;

        const transferLimit = limit ? limit : transfers.length;

        return (
            <ul className={css.historyList}>
                {transfers && transfers.length ? (
                    transfers.slice(0, transferLimit).map((transfer, key) => {
                        const isReceived = addresses.includes(transfer.address);
                        const isConfirmed = transfer.hasPersistence;

                        return (
                            <li
                                key={key}
                                className={classNames(
                                    isReceived ? css.received : css.sent,
                                    isConfirmed ? css.confirmed : css.pending,
                                )}
                            >
                                <span>{formatTime(convertUnixTimeToJSDate(transfer.timestamp))}</span>
                                <span>{!isConfirmed ? 'Pending' : isReceived ? 'Received' : 'Sent'}</span>
                                <span>{`${round(formatValue(transfer.value))} ${formatUnit(transfer.value)}`}</span>
                            </li>
                        );
                    })
                ) : (
                    <li className={css.empty}>No recent history</li>
                )}
            </ul>
        );
    }
}

export default translate('historyList')(HistoryList);
