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

        const addressData = account.addressData.slice().sort((a, b) => b.index - a.index);

        return (
            <div className={settingsCSS.scroll}>
                <Scrollbar>
                    <ul className={css.addresses}>
                        <Scrollbar>
                            {addressData.map((addressObject) => {
                                const address = addressObject.address + addressObject.checksum;

                                return (
                                    <li key={address}>
                                        <p className={isSpent(addressObject) ? css.spent : null}>
                                            <Clipboard
                                                text={address}
                                                title={t('receive:addressCopied')}
                                                success={t('receive:addressCopiedExplanation')}
                                            >
                                                {addressObject.address.match(/.{1,3}/g).join(' ')}{' '}
                                                <mark>{addressObject.checksum.match(/.{1,3}/g).join(' ')}</mark>
                                            </Clipboard>
                                        </p>
                                        <strong>
                                            {formatValue(addressObject.balance)}
                                            {formatUnit(addressObject.balance)}
                                        </strong>
                                    </li>
                                );
                            })}
                        </Scrollbar>
                    </ul>
                </Scrollbar>
            </div>
        );
    }
}

export default withI18n()(Addresses);
