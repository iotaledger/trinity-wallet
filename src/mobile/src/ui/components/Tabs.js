import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { connect } from 'react-redux';
import { isIPhoneX } from 'libs/device';
import { Styling } from 'ui/theme/general';
import { height, width } from 'libs/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        opacity: 0.98,
    },
    tabBarBackground: {
        position: 'absolute',
        flex: 1,
        width,
        height: height / 5,
        marginTop: isIPhoneX ? height / 120 : 0,
    },
    activeTab: {
        width: width / 5,
        height: parseInt(width / 5 + height / (isIPhoneX ? 120 : 160)),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: 'transparent',
        borderTopWidth: parseInt(height / (isIPhoneX ? 120 : 160)),
        position: 'absolute',
    },
});

class Tabs extends Component {
    constructor(props) {
        super(props);
        this.activeTabPosition = new Animated.Value(this.getPosition(props.currentRoute));
    }

    componentWillReceiveProps(newProps) {
        if (this.props.currentRoute !== newProps.currentRoute) {
            this.animateActiveTab(newProps.currentRoute);
        }
    }

    getPosition(route) {
        const routes = ['balance', 'send', 'receive', 'history', 'settings'];
        return routes.indexOf(route) * width / 5;
    }

    animateActiveTab(currentRoute) {
        Animated.timing(this.activeTabPosition, {
            toValue: this.getPosition(currentRoute),
            duration: 150,
            easing: Easing.bezier(0.25, 1, 0.25, 1),
        }).start();
    }

    render() {
        const { currentRoute, children, onPress, theme: { bar, primary } } = this.props;
        const childComponents = Children.map(children, (child) =>
            cloneElement(child, {
                onPress: () => onPress(child.props.name),
                isActive: child.props.name === currentRoute,
            }),
        );
        return (
            <View style={styles.container}>
                <View style={[styles.tabBarBackground, { backgroundColor: bar.bg }]} />
                <Animated.View
                    style={[
                        styles.activeTab,
                        {
                            backgroundColor: bar.hover,
                            borderTopColor: primary.color,
                            borderRadius: isIPhoneX ? Styling.borderRadius : 0,
                        },
                        {
                            transform: [{ translateX: this.activeTabPosition }],
                        },
                    ]}
                />
                <View style={styles.tabBar}>{childComponents}</View>
            </View>
        );
    }
}

Tabs.propTypes = {
    /** Tabs children content */
    children: PropTypes.node.isRequired,
    /** Press event callback function
     * @param {string} name - Name prop for child component
     */
    onPress: PropTypes.func.isRequired,
    /** Currently selected home screen route */
    currentRoute: PropTypes.string.isRequired,
    /** @ignore */
    theme: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    currentRoute: state.home.childRoute,
});

export default connect(mapStateToProps)(Tabs);
