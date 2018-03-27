import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

const styles = StyleSheet.create({
    tabBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'stretch',
        opacity: 0.98,
    },
});

class Tabs extends Component {
    render() {
        const { children, onPress, currentRoute, barBg } = this.props;

        const childComponents = Children.map(children, (child) =>
            cloneElement(child, {
                onPress: () => onPress(child.props.name),
                isActive: child.props.name === currentRoute,
            }),
        );

        const tabContainer = <View style={[styles.tabBar, { backgroundColor: barBg }]}>{childComponents}</View>;

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
    /** Tab bar background color */
    barBg: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
    currentRoute: state.home.childRoute,
});

export default connect(mapStateToProps)(Tabs);
