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
            forceUpdate: PropTypes.bool.isRequired,
            shouldUpdate: PropTypes.bool.isRequired,
            deprecated: PropTypes.bool.isRequired,
            displayTestWarning: PropTypes.bool.isRequired,
            displaySeedMigrationAlert: PropTypes.bool.isRequired,
            seedMigrationUrl: PropTypes.string.isRequired,
        };

        render() {
            return <AlertsComponent {...this.props} />;
        }
    }

    AlertsData.displayName = `withAlertsData(${AlertsComponent.name})`;

    const mapStateToProps = (state) => ({
        alerts: state.alerts,
        forceUpdate: state.wallet.forceUpdate,
        deprecated: state.wallet.deprecated,
        shouldUpdate: state.wallet.shouldUpdate,
        displayTestWarning: state.wallet.displayTestWarning,
        displaySeedMigrationAlert: state.wallet.displaySeedMigrationAlert,
        seedMigrationUrl: state.wallet.seedMigrationUrl,
    });

    const mapDispatchToProps = {
        dismissAlert,
    };

    return connect(mapStateToProps, mapDispatchToProps)(AlertsData);
}
