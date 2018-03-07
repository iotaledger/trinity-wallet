import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedAccountViaSeedIndex } from 'selectors/account';

/**
 * Account name settings component
 */
class Addresses extends PureComponent {
    static propTypes = {
        /** Current account info */
        account: PropTypes.object,
        /** Translation helper
         * @param {String} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { account, t } = this.props;

        return (
            <ul>
                {Object.keys(account.addresses).map((address) => {
                    return <p>{address}</p>;
                })}
            </ul>
        );
    }
}

const mapStateToProps = (state) => ({
    account: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
});

export default connect(mapStateToProps)(translate()(Addresses));
