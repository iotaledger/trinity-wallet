/* global Electron */
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import withAlertsData from 'containers/global/Alerts';

import Icon from 'ui/components/Icon';

import css from './alerts.scss';

/**
 * Alerts UI helper component
 */
export class AlertsComponent extends React.PureComponent {
    static timeout = null;

    static propTypes = {
        /** @ignore */
        dismissAlert: PropTypes.func.isRequired,
        /** @ignore */
        alerts: PropTypes.object.isRequired,
        /** @ignore */
        forceUpdate: PropTypes.bool.isRequired,
        /** @ignore */
        shouldUpdate: PropTypes.bool.isRequired,
        /** @ignore */
        displayTestWarning: PropTypes.bool.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        dismissUpdate: false,
        isUpdating: false,
    };

    componentDidMount() {
        this.onStatusChange = this.statusChange.bind(this);
        Electron.onEvent('update.progress', this.onStatusChange);
    }

    componentWillReceiveProps(nextProps) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (nextProps.alerts.category && nextProps.alerts.category.length && nextProps.alerts.closeInterval > 0) {
            this.timeout = setTimeout(() => {
                this.props.dismissAlert();
            }, nextProps.alerts.closeInterval || 0);
        }
    }

    componentWillUnmount() {
        Electron.removeEvent('update.progress', this.onStatusChange);
    }

    closeAlert() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.props.dismissAlert();
    }

    /**
     * Update update in progress state
     * @param {object} progress - Current update progress percent
     */
    statusChange(progress) {
        this.setState({
            isUpdating: typeof progress === 'object',
        });
    }

    renderFullWidthAlert(title, explanation, dismissable, onClick) {
        const os = Electron.getOS();

        return (
            <section className={classNames(css.update, os === 'win32' ? css.win : null)}>
                <strong onClick={onClick}>{title}</strong> {explanation}
                {dismissable && (
                    <a onClick={() => this.setState({ dismissUpdate: true })}>
                        <Icon icon="cross" size={16} />
                    </a>
                )}
            </section>
        );
    }

    render() {
        /* eslint-disable no-unused-vars */
        const { alerts, dismissAlert, forceUpdate, shouldUpdate, displayTestWarning, t } = this.props;
        const { isUpdating, dismissUpdate } = this.state;
        /* eslint-enable no-unused-vars */

        /**
         * Temporarily override account fetch error by adding Proxy setting suggestion
         */
        const message =
            alerts.message === t('invalidResponseFetchingAccount')
                ? t('invalidResponseFetchingAccountDesktop')
                : alerts.message;

        return (
            <div className={css.wrapper}>
                <div
                    onClick={() => dismissAlert()}
                    className={classNames(
                        alerts.category && alerts.category.length ? css.visible : null,
                        css[`${alerts.category}`],
                    )}
                >
                    <span>
                        <Icon icon="cross" size={14} />
                    </span>
                    {alerts.title && <h2>{alerts.title}</h2>}
                    {message && <p>{message}</p>}
                </div>
            </div>
        );
    }
}

export default withTranslation()(withAlertsData(AlertsComponent));
