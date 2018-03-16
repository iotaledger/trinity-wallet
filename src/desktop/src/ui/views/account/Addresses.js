import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getSelectedAccountViaSeedIndex } from 'selectors/account';

import css from './addresses.css';

/**
 * Account addresses component
 */
class Addresses extends PureComponent {
    static propTypes = {
        /** Current account info */
        account: PropTypes.object,
    };

    render() {
        const { account } = this.props;

        return (
            <ul className={css.addresses}>
                {Object.keys(account.addresses).map((address) => {
                    const text = address.match(/.{1,3}/g).join(' ');
                    return (
                        <p className={account.addresses[address].spent ? css.spent : null} key={address}>
                            {text}
                        </p>
                    );
                })}
            </ul>
        );
    }
}

const mapStateToProps = (state) => ({
    account: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
});

export default connect(mapStateToProps)(Addresses);
