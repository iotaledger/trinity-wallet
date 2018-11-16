import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

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
        };

        render() {
            return <AlertsComponent {...this.props} />;
        }
    }

    AlertsData.displayName = `withAlertsData(${AlertsComponent.name})`;

    const mapStateToProps = (state) => ({
        alerts: state.alerts,
    });

    const mapDispatchToProps = {
        dismissAlert,
    };

    return connect(mapStateToProps, mapDispatchToProps)(AlertsData);
}
