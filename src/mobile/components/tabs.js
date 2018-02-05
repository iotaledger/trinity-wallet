import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { height } from '../util/dimensions';

const styles = StyleSheet.create({
    tabBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        opacity: 0.98,
        paddingBottom: height / 65,
    },
});

class Tabs extends Component {
    render() {
        const { children, onPress, currentRoute } = this.props;

        const childComponents = Children.map(children, child =>
            cloneElement(child, {
                onPress: () => onPress(child.props.name),
                isActive: child.props.name === currentRoute,
            }),
        );

        const tabContainer = (
            <View style={[styles.tabBar, { backgroundColor: this.props.barColor }]}>{childComponents}</View>
        );

        return tabContainer;
    }
}

Tabs.propTypes = {
    children: PropTypes.node.isRequired,
    onPress: PropTypes.func.isRequired,
    currentRoute: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
    currentRoute: state.home.childRoute,
});

export default connect(mapStateToProps)(Tabs);
