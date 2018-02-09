import React from 'react';
import PropTypes from 'prop-types';
import withAlertsData from 'containers/global/Alerts';
import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';

/**
 * Alerts UI helper component
 */
class Alerts extends React.PureComponent {
    static propTypes = {
        /* Dispose alert function
         * @ignore
         */
        disposeOffAlert: PropTypes.func.isRequired,
        /* Alerts state
         * @ignore
         */
        alerts: PropTypes.object.isRequired,
        /* Translation helper
         * @param {String} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { alerts, disposeOffAlert, t } = this.props;

        if (!alerts.category.length) {
            return null;
        }

        return (
            <Modal variant="confirm" isOpen onClose={disposeOffAlert}>
                <h1 className={alerts.category}>{alerts.title}</h1>
                <p>{alerts.message}</p>
                <Button onClick={disposeOffAlert} variant="secondary">
                    {t('global:back')}
                </Button>
            </Modal>
        );
    }
}

export default withAlertsData(Alerts);
