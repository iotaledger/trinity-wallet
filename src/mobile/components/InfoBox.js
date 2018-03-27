import React, { PureComponent } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';
import whiteInfoImagePath from 'iota-wallet-shared-modules/images/info-white.png';
import blackInfoImagePath from 'iota-wallet-shared-modules/images/info-black.png';
import tinycolor from 'tinycolor2';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';

const styles = StyleSheet.create({
    fieldContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        flexDirection: 'row',
        borderBottomLeftRadius: GENERAL.borderRadiusSmall,
        borderBottomRightRadius: GENERAL.borderRadiusSmall,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: height / 23,
        paddingBottom: height / 30,
        paddingHorizontal: width / 17,
    },
    icon: {
        width: height / 24,
        height: height / 24,
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
        /** Content base color */
        body: PropTypes.object.isRequired,
        /** Infobox children content */
        text: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
        /** Infobox width */
        width: PropTypes.number,
    };

    static defaultProps = {
        width: width / 1.2,
    };

    render() {
        const { body, text, width } = this.props;
        const isDark = tinycolor(body.color).isDark();
        const infoImagePath = isDark ? blackInfoImagePath : whiteInfoImagePath;
        const innerContainerBackgroundColor = isDark
            ? { backgroundColor: 'rgba(0, 0, 0, 0.05)' }
            : { backgroundColor: 'rgba(255, 255, 255, 0.05)' };
        const bannerBackgroundColor = isDark
            ? { backgroundColor: 'rgba(0, 0, 0, 0.15)' }
            : { backgroundColor: 'rgba(255, 255, 255, 0.15)' };
        const iconContainerBackgroundColor = isDark
            ? { backgroundColor: 'rgba(0, 0, 0, 0.11)' }
            : { backgroundColor: 'rgba(255, 255, 255, 0.11)' };

        return (
            <View style={styles.fieldContainer}>
                <View style={[styles.banner, bannerBackgroundColor, { width }]} />
                <View style={[styles.iconContainer, iconContainerBackgroundColor]} />
                <Image source={infoImagePath} style={styles.icon} />
                <View style={[styles.innerContainer, innerContainerBackgroundColor, { width }]}>{text}</View>
            </View>
        );
    }
}

export default InfoBox;
