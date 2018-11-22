import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';

import { dismissAlert } from '../../actions/alerts';

/**
 * Alerts component container
 * @ignore
 */
export default function withAlertsData(AlertsComponent) {
    class AlertsData extends React.PureComponent {
        static propTypes = {
            dismissAlert: PropTypes.func.isRequired,
            alerts: PropTypes.object.isRequired,
            forceUpdate: PropTypes.bool.isRequired,
            shouldUpdate: PropTypes.bool.isRequired,
        };

        render() {
            return <AlertsComponent {...this.props} />;
        }
    }

    AlertsData.displayName = `withAlertsData(${AlertsComponent.name})`;

    const mapStateToProps = (state) => ({
        alerts: state.alerts,
        forceUpdate: state.wallet.forceUpdate,
        shouldUpdate: state.wallet.shouldUpdate,
    });

    const mapDispatchToProps = {
        dismissAlert,
    };

    return connect(mapStateToProps, mapDispatchToProps)(withI18n()(AlertsData));
}
