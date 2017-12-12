import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { isAndroid } from '../util/device';
import COLORS from '../theme/Colors';
import BorderShadow from '../components/BorderShadow';

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
        const { children } = this.props;

        const tabContainer = <View style={styles.tabBar}>{children}</View>;

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
    children: PropTypes.node,
};

export default Tabs;
