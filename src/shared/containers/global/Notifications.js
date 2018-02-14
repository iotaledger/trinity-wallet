import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { hideNotification } from '../../actions/notifications';

/**
 * Notifications component container
 * @ignore
 */
export default function withNotificationsData(NotificationsComponent) {
    class NotificationsData extends React.Component {
        static propTypes = {
            hideNotification: PropTypes.func.isRequired,
            notifications: PropTypes.object.isRequired,
            t: PropTypes.func.isRequired,
        };

        render() {
            return <NotificationsComponent {...this.props} />;
        }
    }

    NotificationsData.displayName = `withNotificationsData(${NotificationsComponent.name})`;

    const mapStateToProps = (state) => ({
        notifications: state.notifications,
    });

    const mapDispatchToProps = {
        hideNotification,
    };

    return translate()(connect(mapStateToProps, mapDispatchToProps)(NotificationsData));
}
