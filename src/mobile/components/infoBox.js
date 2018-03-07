import React, { PureComponent } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';
import whiteInfoImagePath from 'iota-wallet-shared-modules/images/info-white.png';
import blackInfoImagePath from 'iota-wallet-shared-modules/images/info-black.png';
import tinycolor from 'tinycolor2';
import { width, height } from '../util/dimensions';
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
        width: width / 1.2,
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
        width: width / 1.2,
    },
});

class InfoBox extends PureComponent {
    static propTypes = {
        body: PropTypes.object,
        text: PropTypes.string.isRequired,
    };

    render() {
        const { body, text } = this.props;
        const isBackgroundLight = tinycolor(body.bg).isLight();
        const infoImagePath = isBackgroundLight ? whiteInfoImagePath : blackInfoImagePath;
        const innerContainerBackgroundColor = isBackgroundLight
            ? { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            : { backgroundColor: 'rgba(0, 0, 0, 0.05)' };
        const bannerBackgroundColor = isBackgroundLight
            ? { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
            : { backgroundColor: 'rgba(0, 0, 0, 0.15)' };
        const iconContainerBackgroundColor = isBackgroundLight
            ? { backgroundColor: 'rgba(255, 255, 255, 0.11)' }
            : { backgroundColor: 'rgba(0, 0, 0, 0.11)' };

        return (
            <View style={styles.fieldContainer}>
                <View style={[styles.banner, bannerBackgroundColor]} />
                <View style={[styles.iconContainer, iconContainerBackgroundColor]} />
                <Image source={infoImagePath} style={styles.icon} />
                <View style={[styles.innerContainer, innerContainerBackgroundColor]}>{text}</View>
            </View>
        );
    }
}

export default InfoBox;
