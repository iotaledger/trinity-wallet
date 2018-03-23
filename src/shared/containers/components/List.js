import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { selectAccountInfo } from '../../selectors/accounts';

/**
 * List component container
 * @ignore
 */
export default function withListData(ListComponent) {
    class ListData extends React.PureComponent {
        static propTypes = {
            accountInfo: PropTypes.object.isRequired,
            limit: PropTypes.number,
            filter: PropTypes.string,
            compact: PropTypes.bool,
            t: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
        };

        render() {
            const { accountInfo, limit, compact, filter, theme, t } = this.props;

            const ListProps = {
                transfers: accountInfo.transfers && accountInfo.transfers.length ? accountInfo.transfers : [],
                addresses: Object.keys(accountInfo.addresses),
                compact,
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
        accountInfo: selectAccountInfo(state),
        theme: state.settings.theme,
    });

    return translate()(connect(mapStateToProps, {})(ListData));
}
