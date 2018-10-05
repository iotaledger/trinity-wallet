import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';

const styles = StyleSheet.create({
    fieldContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        flexDirection: 'row',
        borderBottomLeftRadius: Styling.borderRadiusSmall,
        borderBottomRightRadius: Styling.borderRadiusSmall,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: height / 23,
        paddingBottom: height / 30,
        paddingHorizontal: width / 17,
    },
    icon: {
        position: 'absolute',
        top: height / 24 - height / 48,
        left: width / 17,
    },
    iconContainer: {
        width: height / 24,
        height: height / 48,
        borderBottomLeftRadius: height / 24,
        borderBottomRightRadius: height / 24,
        justifyContent: 'flex-end',
        position: 'absolute',
        top: height / 24,
        left: width / 17,
    },
    banner: {
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        height: height / 24,
        alignItems: 'center',
    },
});

class InfoBox extends PureComponent {
    static propTypes = {
        /** Content base colors */
        body: PropTypes.object.isRequired,
        /** Infobox children content */
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
        /** Infobox width */
        width: PropTypes.number,
        containerStyle: PropTypes.object,
    };

    static defaultProps = {
        width: Styling.contentWidth,
    };

    render() {
        const { body, text, width, containerStyle } = this.props;
        const isBgLight = tinycolor(body.bg).isLight();
        const fieldContainerStyling = isBgLight ? null : { backgroundColor: 'rgba(255, 255, 255, 0.05)' };
        const innerContainerStyling = isBgLight
            ? { borderColor: body.color, borderWidth: 1 }
            : { backgroundColor: 'rgba(255, 255, 255, 0.05)' };
        const bannerStyling = isBgLight
            ? {
                  borderColor: body.color,
                  borderTopWidth: 1,
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
              }
            : { backgroundColor: 'rgba(255, 255, 255, 0.15)' };
        const iconContainerStyling = isBgLight ? { borderWidth: 1 } : { backgroundColor: 'rgba(255, 255, 255, 0.11)' };
        const iconStyling = isBgLight ? { backgroundColor: body.bg } : null;

        return (
            <View style={[styles.fieldContainer, fieldContainerStyling, containerStyle]}>
                <View style={[styles.banner, bannerStyling, { width }]} />
                <View style={[styles.innerContainer, innerContainerStyling, { width }]}>{text}</View>
                <View style={[styles.iconContainer, iconContainerStyling]} />
                <Icon name="info" size={height / 24} color={body.color} style={[styles.icon, iconStyling]} />
            </View>
        );
    }
}

export default InfoBox;
