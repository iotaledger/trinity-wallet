import React, { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { isAndroid } from '../util/device';
import COLORS from '../theme/Colors';
import BorderShadow from './borderShadow';

import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    tabBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        backgroundColor: COLORS.backgroundDarkGreen,
        opacity: 0.98,
        paddingBottom: height / 65,
        shadowColor: COLORS.backgroundDarkGreen,
        shadowRadius: 4,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 1.0,
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

        const tabContainer = <View style={styles.tabBar}>{childComponents}</View>;

        if (isAndroid) {
            return (
                <BorderShadow
                    width={width}
                    height={8}
                    color={COLORS.backgroundDarkGreen}
                    border={5}
                    opacity={0.6}
                    side="top"
                    style={{ flex: 1 }}
                >
                    {tabContainer}
                </BorderShadow>
            );
        }

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
