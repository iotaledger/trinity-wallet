import React from 'react';
import PropTypes from 'prop-types';
import withAlertsData from 'containers/global/Alerts';

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

    render() {
        const { alerts, disposeOffAlert } = this.props;

        if (!alerts.category.length) {
            return null;
        }

        return (
            <div className={css.wrapper}>
                <div className={css[`${alerts.category}`]}>
                    <span onClick={() => disposeOffAlert()}>×</span>
                    {alerts.title && <h2>{alerts.title}</h2>}
                    {alerts.message && <div>{alerts.message}</div>}
                </div>
            </div>
        );
    }
}

export default withAlertsData(Alerts);
