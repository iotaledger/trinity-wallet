import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { formatValue, formatUnit } from 'libs/iota/utils';
import { selectAccountInfo } from 'selectors/accounts';

import Scrollbar from 'ui/components/Scrollbar';
import Clipboard from 'ui/components/Clipboard';

import css from './addresses.scss';

/**
 * Account addresses component
 */
class Addresses extends PureComponent {
    static propTypes = {
        /** Current account info */
        account: PropTypes.object,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { account, t } = this.props;

        return (
            <ul className={css.addresses}>
                <Scrollbar>
                    {Object.keys(account.addresses).reverse().map((address) => {
                        const text = address.match(/.{1,3}/g).join(' ');
                        return (
                            <li key={address}>
                                <p className={account.addresses[address].spent ? css.spent : null}>
                                    <Clipboard
                                        text={address}
                                        label={text}
                                        title={t('receive:addressCopied')}
                                        success={t('receive:addressCopiedExplanation')}
                                    />
                                </p>
                                <strong>
                                    {formatValue(account.addresses[address].balance)}{' '}
                                    {formatUnit(account.addresses[address].balance)}
                                </strong>
                            </li>
                        );
                    })}
                </Scrollbar>
            </ul>
        );
    }
}

const mapStateToProps = (state) => ({
    account: selectAccountInfo(state),
});

export default connect(mapStateToProps)(translate()(Addresses));
