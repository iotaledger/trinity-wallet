import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { disposeOffAlert } from 'actions/alerts';
import PropTypes from 'prop-types';
import Modal from 'components/UI/Modal';
import Button from 'components/UI/Button';

class Alerts extends React.PureComponent {
    static propTypes = {
        disposeOffAlert: PropTypes.func.isRequired,
        alerts: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
    };

    static defaultProps = {
        notifications: {},
    };

    state = {};

    render() {
        const { alerts, disposeOffAlert, t } = this.props;

        if (!alerts.category.length) {
            return null;
        }

        return (
            <Modal isConfirm isOpen hideCloseButton>
                <h1 className={alerts.category}>{alerts.title}</h1>
                <p>{alerts.message}</p>
                <Button onClick={disposeOffAlert} variant="success">
                    {t('global:back')}
                </Button>
            </Modal>
        );
    }
}

const mapStateToProps = state => ({
    alerts: state.alerts,
});

const mapDispatchToProps = {
    disposeOffAlert,
};

export default translate('alerts')(connect(mapStateToProps, mapDispatchToProps)(Alerts));
