import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';

const styles = StyleSheet.create({
    fieldContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width,
    },
    innerContainer: {
        width: Styling.contentWidth,
        paddingVertical: height / 22,
    },
});

class InfoBox extends PureComponent {
    static propTypes = {
        /** Infobox children content */
        children: PropTypes.oneOfType([PropTypes.node, PropTypes.number, PropTypes.object]),
        /** Container style object */
        containerStyle: PropTypes.object,
        /** @ignore */
        theme: PropTypes.object,
    };

    static defaultProps = {
        width: Styling.contentWidth,
    };

    render() {
        const { children, containerStyle, theme: { dark } } = this.props;

        return (
            <View style={[styles.fieldContainer, containerStyle, { backgroundColor: dark.color }]}>
                <View style={[styles.innerContainer]}>{children}</View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

export default connect(mapStateToProps)(InfoBox);
