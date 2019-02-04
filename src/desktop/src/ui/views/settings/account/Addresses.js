import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { formatValue, formatUnit } from 'libs/iota/utils';

import Scrollbar from 'ui/components/Scrollbar';
import Clipboard from 'ui/components/Clipboard';

import css from './addresses.scss';
import settingsCSS from '../index.scss';

/**
 * Account addresses component
 */
class Addresses extends PureComponent {
    static propTypes = {
        /** @ignore */
        account: PropTypes.object,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { account, t } = this.props;
        const isSpent = ({ spent: { local, remote } }) => local || remote;

        const addresses = account.addresses
            ? Object.keys(account.addresses)
                  .map((address) => Object.assign({ address }, account.addresses[address]))
                  .sort((a, b) => b.index - a.index)
            : [];

        return (
            <div className={settingsCSS.scroll}>
                <Scrollbar>
                    <ul className={css.addresses}>
                        {addresses.map((item) => {
                            const address = item.address + item.checksum;
                            return (
                                <li key={address}>
                                    <p className={isSpent(item) ? css.spent : null}>
                                        <Clipboard
                                            text={address}
                                            title={t('receive:addressCopied')}
                                            success={t('receive:addressCopiedExplanation')}
                                        >
                                            {item.address.match(/.{1,3}/g).join(' ')}{' '}
                                            <mark>{item.checksum.match(/.{1,3}/g).join(' ')}</mark>
                                        </Clipboard>
                                    </p>
                                    <strong>
                                        {formatValue(item.balance)}
                                        {formatUnit(item.balance)}
                                    </strong>
                                </li>
                            );
                        })}
                    </ul>
                </Scrollbar>
            </div>
        );
    }
}

export default withI18n()(Addresses);
