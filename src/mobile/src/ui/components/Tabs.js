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
    },
});

class Tabs extends Component {
    constructor() {
        super();
        this.activeTabPosition = new Animated.Value(0);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.currentRoute !== newProps.currentRoute) {
            this.animateActiveTab(newProps.currentRoute);
        }
    }

    animateActiveTab(currentRoute) {
        const routes = ['balance', 'send', 'receive', 'history', 'settings'];
        Animated.timing(this.activeTabPosition, {
            toValue: routes.indexOf(currentRoute) * width / 5,
            duration: 300,
            easing: Easing.bezier(0.25, 1, 0.25, 1),
        }).start();
    }

    render() {
        const { children, onPress, theme: { bar, primary } } = this.props;

        const childComponents = Children.map(children, (child) =>
            cloneElement(child, { onPress: () => onPress(child.props.name) }),
        );

        const tabContainer = (
            <View style={styles.container}>
                <View style={[styles.tabBarBackground, { backgroundColor: bar.alt }]}>
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
                </View>
                <View style={styles.tabBar}>{childComponents}</View>
            </View>
        );

        return tabContainer;
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
