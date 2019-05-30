/* global Electron */
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
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
    };

    componentWillReceiveProps(nextProps) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (nextProps.alerts.category && nextProps.alerts.category.length && nextProps.alerts.closeInterval > 0) {
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
        const { alerts, dismissAlert, forceUpdate, shouldUpdate, displayTestWarning, t } = this.props;
        const { dismissUpdate } = this.state;

        /**
         * Temporarily override account fetch error by adding Proxy setting suggestion
         */
        const message =
            alerts.message === t('invalidResponseFetchingAccount')
                ? t('invalidResponseFetchingAccountDesktop')
                : alerts.message;

        return (
            <div className={css.wrapper}>
                {!dismissUpdate &&
                    displayTestWarning &&
                    this.renderFullWidthAlert(`${t('rootDetection:warning')}:`, t('global:testVersionWarning'), true)}
                {!dismissUpdate &&
                    shouldUpdate &&
                    this.renderFullWidthAlert(t('global:shouldUpdate'), t('global:shouldUpdateExplanation'), true, () =>
                        Electron.autoUpdate(),
                    )}
                {forceUpdate &&
                    this.renderFullWidthAlert(t('global:forceUpdate'), t('global:forceUpdateExplanation'), false, () =>
                        Electron.autoUpdate(),
                    )}
                {(!dismissUpdate && (forceUpdate || shouldUpdate)) || (
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
                )}
            </div>
        );
    }
}

export default withAlertsData(AlertsComponent);
