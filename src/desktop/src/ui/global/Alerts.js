import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import withAlertsData from 'containers/global/Alerts';

import Icon from 'ui/components/Icon';

import css from './alerts.css';

/**
 * Alerts UI helper component
 */
class Alerts extends React.PureComponent {
    static propTypes = {
        /** Dispose alert function
         * @ignore
         */
        disposeOffAlert: PropTypes.func.isRequired,
        /** Alerts state
         * @ignore
         */
        alerts: PropTypes.object.isRequired,
    };

    static timeout = null;

    componentWillReceiveProps(nextProps) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (nextProps.alerts.category.length && nextProps.alerts.closeInterval > 0) {
            this.timeout = setTimeout(() => {
                this.props.disposeOffAlert();
            }, nextProps.alerts.closeInterval);
        }
    }

    closeAlert() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.props.disposeOffAlert();
    }

    render() {
        const { alerts, disposeOffAlert } = this.props;

        return (
            <div className={css.wrapper}>
                <div className={classNames(alerts.category.length ? css.visible : null, css[`${alerts.category}`])}>
                    <span onClick={() => disposeOffAlert()}>
                        <Icon icon="cross" size={32} />
                    </span>
                    {alerts.title && <h2>{alerts.title}</h2>}
                    {alerts.message && <p>{alerts.message}</p>}
                </div>
            </div>
        );
    }
}

export default withAlertsData(Alerts);
