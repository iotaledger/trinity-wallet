import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, PanResponder, ViewPropTypes, StyleSheet } from 'react-native';

export default class UserInactivity extends Component {
    static propTypes = {
        timeForInactivity: PropTypes.number,
        checkInterval: PropTypes.number,
        children: PropTypes.node.isRequired,
        style: ViewPropTypes.style,
        onInactivity: PropTypes.func.isRequired,
    };

    static defaultProps = {
        timeForInactivity: 10000,
        checkInterval: 2000,
        style: {
            flex: 1,
        },
    };

    state = {};
    lastInteraction = new Date();
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
        clearInterval(this.inactivityTimer);
        this.panResponder = null;
        this.inactivityTimer = null;
    }

    onStartShouldSetPanResponder = () => {
        this.setIsActive();
        return false;
    };

    onMoveShouldSetPanResponder = () => {
        this.setIsActive();
        return false;
    };

    maybeStartWatchingForInactivity = () => {
        if (this.inactivityTimer) {
            return;
        }
        const { timeForInactivity, checkInterval } = this.props;

        this.inactivityTimer = setInterval(() => {
            if (new Date() - this.lastInteraction >= timeForInactivity) {
                this.setIsInactive();
            }
        }, checkInterval);
    };

    setIsActive = () => {
        this.lastInteraction = new Date();
        if (this.state.timeWentInactive) {
            this.setState({ timeWentInactive: null });
        }
        this.maybeStartWatchingForInactivity();
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
        clearInterval(this.inactivityTimer);
        this.inactivityTimer = null;
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
