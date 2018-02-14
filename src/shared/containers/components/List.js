import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getSelectedAccountNameViaSeedIndex } from '../../selectors/account';
import { translate } from 'react-i18next';

/**
 * List component container
 * @ignore
 */
export default function withListData(ListComponent) {
    class ListData extends React.Component {
        static propTypes = {
            account: PropTypes.object.isRequired,
            accountName: PropTypes.string.isRequired,
            limit: PropTypes.number,
            filter: PropTypes.string,
            t: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
        };

        render() {
            const { account, accountName, limit, filter, theme, t } = this.props;

            const accountInfo = account.accountInfo[accountName];

            const ListProps = {
                transfers: accountInfo.transfers.length ? accountInfo.transfers : [],
                addresses: Object.keys(accountInfo.addresses),
                theme,
                limit,
                filter,
                t,
            };

            return <ListComponent {...ListProps} />;
        }
    }

    ListData.displayName = `withListData(${ListComponent.displayName || ListComponent.name})`;

    const mapStateToProps = (state) => ({
        account: state.account,
        accountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
        theme: state.settings.theme,
    });

    return translate()(connect(mapStateToProps, {})(ListData));
}
