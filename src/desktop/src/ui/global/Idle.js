/* global Electron */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

import { setPassword } from 'actions/wallet';

import ModalPassword from 'ui/components/modal/Password';

const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

/**
 * User idle lock screen component
 */
class Idle extends React.Component {
    static propTypes = {
        /** @ignore */
        setPassword: PropTypes.func.isRequired,
        /** @ignore */
        timeout: PropTypes.number.isRequired,
        /** @ignore */
        isAuthorised: PropTypes.bool.isRequired,
    };

    state = {
        locked: false,
    };

    componentDidMount() {
        this.restartLockTimeout = debounce(this.handleEvent, 500);
        this.attachEvents();
        this.onSetIdle = this.lock.bind(this);
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

    lock() {
        if (this.props.isAuthorised) {
            this.props.setPassword({});
            this.setState({ locked: true });
            Electron.updateMenu('enabled', false);
        }
    }

    unlock(password) {
        this.props.setPassword(password);
        this.setState({
            locked: false,
        });
        Electron.updateMenu('enabled', true);
    }

    attachEvents() {
        events.forEach((event) => {
            window.addEventListener(event, this.restartLockTimeout, true);
        });
    }

    removeEvents() {
        events.forEach((event) => {
            window.removeEventListener(event, this.restartLockTimeout, true);
        });
    }

    handleEvent = () => {
        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            if (this.props.isAuthorised) {
                this.lock();
            } else {
                this.handleEvent();
            }
        }, this.props.timeout * 60 * 1000);
    };

    render() {
        if (!this.state.locked) {
            return null;
        }
        return <ModalPassword isOpen isForced skip2fa content={{}} onSuccess={(password) => this.unlock(password)} />;
    }
}

const mapStateToProps = (state) => ({
    timeout: state.settings.lockScreenTimeout,
    isAuthorised: state.wallet.ready,
});

const mapDispatchToProps = {
    setPassword,
};

export default connect(mapStateToProps, mapDispatchToProps)(Idle);
