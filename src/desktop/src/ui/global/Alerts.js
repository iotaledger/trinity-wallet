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
class Alerts extends React.PureComponent {
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

    render() {
        const { alerts, dismissAlert, forceUpdate, shouldUpdate, t } = this.props;
        const { dismissUpdate } = this.state;

        const os = Electron.getOS();

        /**
         * Temporarily override account fetch error by adding Proxy setting suggestion
         */
        const message =
            alerts.message === t('invalidResponseFetchingAccount')
                ? t('invalidResponseFetchingAccountDesktop')
                : alerts.message;

        return (
            <div className={css.wrapper}>
                {!dismissUpdate && (forceUpdate || shouldUpdate) ? (
                    <section className={classNames(css.update, os === 'win32' ? css.win : null)}>
                        <strong onClick={() => Electron.autoUpdate()}>
                            {t(`global:${forceUpdate ? 'forceUpdate' : 'shouldUpdate'}`)}
                        </strong>{' '}
                        {t(`global:${forceUpdate ? 'forceUpdate' : 'shouldUpdate'}Explanation`)}
                        {shouldUpdate && (
                            <a onClick={() => this.setState({ dismissUpdate: true })}>
                                <Icon icon="cross" size={16} />
                            </a>
                        )}
                    </section>
                ) : (
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

export default withAlertsData(Alerts);
