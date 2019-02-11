import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, PanResponder, ViewPropTypes } from 'react-native';
import timer from 'react-native-timer';

export default class UserInactivity extends Component {
    static propTypes = {
        /** Inactivity time threshold for inactivity logout */
        timeForInactivity: PropTypes.number,
        /** Inactivity time threshold for full logout */
        timeForLogout: PropTypes.number,
        /** Interval after application inactivity should be checked */
        checkInterval: PropTypes.number,
        /** Children content */
        children: PropTypes.node.isRequired,
        /** Content styles */
        style: ViewPropTypes.style,
        /** On inactivity callback function
         * @param {number} timeWentInactive
         */
        onInactivity: PropTypes.func.isRequired,
        /** Trigger full logout */
        logout: PropTypes.func.isRequired,
    };

    static defaultProps = {
        // 5 minutes
        timeForInactivity: 300000,
        // 30 minutes
        timeForLogout: 1800000,
        checkInterval: 2000,
        style: {
            flex: 1,
        },
    };

    state = {};
    lastInteraction = new Date(); // eslint-disable-line react/sort-comp
    panResponder = {};

    componentWillMount() {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: this.onStartShouldSetPanResponder,
            onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,
            onStartShouldSetPanResponderCapture: () => false,
            onMoveShouldSetPanResponderCapture: () => false,
            onPanResponderTerminationRequest: () => true,
            onShouldBlockNativeResponder: () => false,
        });

        this.maybeStartWatchingForInactivity();
    }

    componentWillUnmount() {
        timer.clearInterval('inactivityTimer');
        timer.clearTimeout('logoutTimer');
        this.panResponder = null;
        this.inactivityTimer = null;
    }

    setActiveFromComponent() {
        this.setIsActive();
        return false;
    }

    onStartShouldSetPanResponder = () => {
        this.setIsActive();
        return false;
    };

    onMoveShouldSetPanResponder = () => {
        this.setIsActive();
        return false;
    };

    setIsActive = () => {
        this.lastInteraction = new Date();
        if (this.state.timeWentInactive) {
            this.setState({ timeWentInactive: null });
        }
        this.maybeStartWatchingForInactivity();
        timer.clearTimeout('logoutTimer');
    };

    setIsInactive = () => {
        const timeWentInactive = new Date();
        this.setState(
            {
                timeWentInactive,
            },
            () => {
                this.props.onInactivity(timeWentInactive);
            },
        );
        timer.clearInterval('inactivityTimer');
        this.inactivityTimer = null;
    };

    maybeStartWatchingForInactivity = () => {
        if (this.inactivityTimer) {
            return;
        }
        const { timeForInactivity, timeForLogout, checkInterval } = this.props;

        this.inactivityTimer = timer.setInterval(
            'inactivityTimer',
            () => {
                if (new Date() - this.lastInteraction >= timeForInactivity) {
                    this.setIsInactive();
                    timer.setTimeout('logoutTimer', () => this.props.logout(), timeForLogout - timeForInactivity);
                }
            },
            checkInterval,
        );
    };

    render() {
        const { style, children } = this.props;
        return (
            <View style={style} collapsable={false} {...this.panResponder.panHandlers}>
                {children}
            </View>
        );
    }
}
