import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getSelectedAccountViaSeedIndex } from 'selectors/account';

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
            <ul>
                {Object.keys(account.addresses).map((address) => {
                    return <p key={address}>{address}</p>;
                })}
            </ul>
        );
    }
}

const mapStateToProps = (state) => ({
    account: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
});

export default connect(mapStateToProps)(Addresses);
