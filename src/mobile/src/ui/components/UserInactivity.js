import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, PanResponder, ViewPropTypes } from 'react-native';
import timer from 'react-native-timer';
import { getGetSystemUptimeFn } from 'libs/nativeModules';

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
    lastInteraction = null; // eslint-disable-line react/sort-comp
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

    componentDidMount() {
        this.getSystemUptime().then((time) => {
            this.lastInteraction = time;
        });
    }

    componentWillUnmount() {
        timer.clearInterval('inactivityTimer');
        timer.clearTimeout('logoutTimer');
        this.panResponder = null;
        this.inactivityTimer = null;
    }

    getSystemUptime() {
        return getGetSystemUptimeFn()().then(parseInt);
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
        this.getSystemUptime().then((time) => {
            this.lastInteraction = time;

            if (this.state.timeWentInactive) {
                this.setState({ timeWentInactive: null });
            }
            this.maybeStartWatchingForInactivity();
            timer.clearTimeout('logoutTimer');
        });
    };

    setIsInactive = () => {
        const { timeForLogout, timeForInactivity } = this.props;
        const timeWentInactive = new Date();
        this.setState(
            {
                timeWentInactive,
            },
            () => {
                this.props.onInactivity(timeWentInactive);
            },
        );
        timer.setTimeout('logoutTimer', () => this.props.logout(), timeForLogout - timeForInactivity);
        timer.clearInterval('inactivityTimer');
        this.inactivityTimer = null;
    };

    maybeStartWatchingForInactivity = () => {
        if (this.inactivityTimer) {
            return;
        }
        const { timeForInactivity, checkInterval } = this.props;

        this.inactivityTimer = timer.setInterval(
            'inactivityTimer',
            () => {
                this.getSystemUptime().then((currentTime) => {
                    if (currentTime - this.lastInteraction >= timeForInactivity) {
                        this.setIsInactive();
                    }
                });
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
