import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import withAlertsData from 'containers/global/Alerts';

import Icon from 'ui/components/Icon';

import css from './alerts.scss';

/**
 * Alerts UI helper component
 */
class Alerts extends React.PureComponent {
    static timeout = null;

    static propTypes = {
        /** @ignore */
        dismissAlert: PropTypes.func.isRequired,
        /** @ignore */
        alerts: PropTypes.object.isRequired,
    };

    componentWillReceiveProps(nextProps) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (nextProps.alerts.category.length && nextProps.alerts.closeInterval > 0) {
            this.timeout = setTimeout(() => {
                this.props.dismissAlert();
            }, nextProps.alerts.closeInterval);
        }
    }

    closeAlert() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.props.dismissAlert();
    }

    render() {
        const { alerts, dismissAlert } = this.props;

        return (
            <div className={css.wrapper}>
                <div
                    onClick={() => dismissAlert()}
                    className={classNames(alerts.category.length ? css.visible : null, css[`${alerts.category}`])}
                >
                    <span>
                        <Icon icon="cross" size={14} />
                    </span>
                    {alerts.title && <h2>{alerts.title}</h2>}
                    {alerts.message && <p>{alerts.message}</p>}
                </div>
            </div>
        );
    }
}

export default withAlertsData(Alerts);
