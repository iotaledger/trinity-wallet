import React from 'react';
import withNotificationsData from 'containers/global/Notifications';
import PropTypes from 'prop-types';

import css from './Notifications.css';

/**
 * Notifications UI helper component
 */
class Notifications extends React.PureComponent {
    static propTypes = {
        /* Dispose notification function
         * @param {string} id - Notificaion identifier
         * @ignore
         */
        hideNotification: PropTypes.func.isRequired,
        /* Notifications state
         * @ignore
         */
        notifications: PropTypes.object.isRequired,
        /* Translation helper
         * @param (string) translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    static defaultProps = {
        notifications: {},
    };

    hideNotification = (id) => {
        return () => this.props.hideNotification(id);
    };

    render() {
        const { notifications, t } = this.props;
        return (
            <div className={css.wrapper}>
                {Object.keys(notifications).map((id) => {
                    let { title, text } = notifications[id];

                    const { type = 'info', translationScope, translate } = notifications[id];

                    if (translationScope || translate) {
                        title = t(title, { ns: translationScope || 'notifications' });
                        text = t(text, { ns: translationScope || 'notifications' });
                    }

                    return (
                        <div key={id} className={css[`notification--${type}`]}>
                            <span onClick={this.hideNotification(id)}>×</span>
                            {title && <h2>{title}</h2>}
                            {text && <div>{text}</div>}
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default withNotificationsData(Notifications);
