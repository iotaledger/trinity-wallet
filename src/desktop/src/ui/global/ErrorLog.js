/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { formatTimeAs, detectedTimezone } from 'libs/date';

import { clearLog } from 'actions/alerts';

import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Scrollbar from 'ui/components/Scrollbar';

import css from './about.scss';

/**
 * Error log window component
 */
class ErrorLog extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        log: PropTypes.array.isRequired,
        /** @ignore */
        clearLog: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        visible: false,
    };

    componentDidMount() {
        this.onMenuToggle = this.menuToggle.bind(this);
        Electron.onEvent('menu', this.onMenuToggle);
    }

    componentWillUnmount() {
        Electron.removeEvent('menu', this.onMenuToggle);
    }

    /**
     * Proxy native menu triggers to an action
     * @param {string} Item - Triggered menu item
     */
    menuToggle(item) {
        this.setState({
            visible: item === 'errorlog',
        });
    }

    render() {
        const { clearLog, log, t } = this.props;
        const { visible } = this.state;

        return (
            <Modal variant="global" isOpen={visible} onClose={() => this.setState({ visible: false })}>
                <section className={css.about}>
                    <h5>{t('notificationLog:errorLog')}</h5>
                    <article>
                        <Scrollbar>
                            <ul className={css.log}>
                                {log
                                    .slice(0)
                                    .reverse()
                                    .map((entry, index) => {
                                        return (
                                            <li key={`log-${index}`}>
                                                <strong>
                                                    {formatTimeAs.dayMonthYearHoursMinutes(
                                                        navigator.language,
                                                        detectedTimezone,
                                                        entry.date,
                                                    )}
                                                </strong>{' '}
                                                {entry.error}
                                            </li>
                                        );
                                    })}
                            </ul>
                        </Scrollbar>
                    </article>
                    <footer>
                        <Button onClick={() => clearLog()} variant="dark">
                            {t('clear')}
                        </Button>
                        <Button onClick={() => this.setState({ visible: false })} variant="dark">
                            {t('close')}
                        </Button>
                    </footer>
                </section>
            </Modal>
        );
    }
}

const mapStateToProps = (state) => ({
    log: state.alerts.notificationLog,
});

const mapDispatchToProps = {
    clearLog,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ErrorLog));
