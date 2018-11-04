import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { isIPhoneX } from 'libs/device';
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
});

class Tabs extends Component {
    render() {
        const { children, onPress, currentRoute, theme: { bar } } = this.props;

        const childComponents = Children.map(children, (child) =>
            cloneElement(child, {
                onPress: () => onPress(child.props.name),
                isActive: child.props.name === currentRoute,
            }),
        );

        const tabContainer = (
            <View style={styles.container}>
                <View style={[styles.tabBarBackground, { backgroundColor: bar.alt }]} />
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
