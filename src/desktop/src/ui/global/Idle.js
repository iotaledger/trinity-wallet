/*global Electron*/
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import ModalPassword from 'ui/components/modal/Password';

const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

/**
 * User idle lock screen
 * @ignore
 */
class Idle extends React.Component {
    static propTypes = {
        /** Idle timeout*/
        timeout: PropTypes.number.isRequired,
        /** User authorised state */
        isAuthorised: PropTypes.bool.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        idle: false,
    };

    componentDidMount() {
        this.attachEvents();
        this.onSetIdle = this.setIdle.bind(this);
        Electron.onEvent('lockScreen', this.onSetIdle);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isAuthorised && nextProps.isAuthorised) {
            this.handleEvent();
        }
    }

    componentWillUnmount() {
        this.removeEvents();
        Electron.removeEvent('lockScreen', this.onSetIdle);
    }

    setIdle() {
        if (this.props.isAuthorised) {
            this.setState({ idle: true });
        }
    }

    handleEvent = () => {
        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            if (this.props.isAuthorised) {
                this.setState({ idle: true });
            } else {
                this.handleEvent();
            }
        }, this.props.timeout);
    };

    attachEvents() {
        events.forEach((event) => {
            window.addEventListener(event, this.handleEvent, true);
        });
    }

    removeEvents() {
        events.forEach((event) => {
            window.removeEventListener(event, this.handleEvent, true);
        });
    }

    render() {
        if (!this.state.idle) {
            return null;
        }
        return (
            <ModalPassword
                isOpen
                isForced
                onSuccess={() => this.setState({ idle: false })}
                content={{
                    title: this.props.t('Enter password to access wallet'),
                }}
            />
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthorised: state.tempAccount.ready,
});

export default connect(mapStateToProps)(translate()(Idle));
