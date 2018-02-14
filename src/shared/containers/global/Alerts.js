import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { disposeOffAlert } from '../../actions/alerts';

/**
 * Alerts component container
 * @ignore
 */
export default function withAlertsData(AlertsComponent) {
    class AlertsData extends React.Component {
        static propTypes = {
            disposeOffAlert: PropTypes.func.isRequired,
            alerts: PropTypes.object.isRequired,
            t: PropTypes.func.isRequired,
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
        disposeOffAlert,
    };

    return translate()(connect(mapStateToProps, mapDispatchToProps)(AlertsData));
}
