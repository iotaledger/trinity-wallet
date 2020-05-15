import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { formatTime, convertUnixTimeToJSDate, detectedTimezone } from 'libs/date';
import { formatIotas } from 'libs/iota/utils';

import Icon from 'ui/components/Icon';

import css from './list.scss';

export default class TransactionRow extends React.PureComponent {
    static propTypes = {
        /** Transaction index */
        index: PropTypes.number.isRequired,
        /** Transactions */
        data: PropTypes.array.isRequired,
        /** Style object */
        style: PropTypes.object.isRequired,
    };

    render() {
        const transaction = this.props.data[this.props.index];

        const isReceived = transaction.incoming;
        const isConfirmed = transaction.persistence;

        return (
            <a
                style={this.props.style}
                key={this.props.index}
                onClick={() => transaction.setItem(transaction.bundle)}
                className={classNames(isConfirmed ? css.confirmed : css.pending, isReceived ? css.received : css.sent)}
            >
                <div>
                    {isReceived ? <Icon icon="plus" size={14} /> : <Icon icon="minus" size={14} />}
                    <span>
                        {formatTime(
                            navigator.language,
                            detectedTimezone,
                            convertUnixTimeToJSDate(transaction.timestamp),
                        )}
                    </span>
                    <span>
                        {!isConfirmed
                            ? isReceived
                                ? transaction.t('receiving')
                                : transaction.t('sending')
                            : isReceived
                            ? transaction.t('received')
                            : transaction.t('sent')}
                    </span>
                    <span>
                        {transaction.transferValue === 0 ? '' : isReceived ? '+' : '-'}
                        {formatIotas(transaction.transferValue, true, true)}
                    </span>
                </div>
            </a>
        );
    }
}
