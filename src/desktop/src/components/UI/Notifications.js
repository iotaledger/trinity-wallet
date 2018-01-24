import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { hideNotification } from 'actions/notifications';
import PropTypes from 'prop-types';

import css from './Notifications.css';

class Notifications extends React.PureComponent {
    static propTypes = {
        hideNotification: PropTypes.func.isRequired,
        notifications: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired
    };

    static defaultProps = {
        notifications: {}
    };

    state = {};

    hideNotification = id => {
        return () => this.props.hideNotification(id);
    };

    render() {
        const { notifications, t } = this.props;
        return (
            <div className={css.wrapper}>
                {Object.keys(notifications).map(id => {
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

const mapStateToProps = state => ({
    notifications: state.notifications
});

const mapDispatchToProps = {
    hideNotification
};

export default translate('notifications')(connect(mapStateToProps, mapDispatchToProps)(Notifications));
