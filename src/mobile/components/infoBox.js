import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, Image } from 'react-native';
import PropTypes from 'prop-types';
import whiteInfoImagePath from 'iota-wallet-shared-modules/images/info-white.png';
import blackInfoImagePath from 'iota-wallet-shared-modules/images/info-black.png';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';
import THEMES from '../theme/themes';

const styles = StyleSheet.create({
    fieldContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        flexDirection: 'row',
        borderBottomLeftRadius: GENERAL.borderRadiusSmall,
        borderBottomRightRadius: GENERAL.borderRadiusSmall,
        width: width / 1.36,
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
        top: height / 48,
        left: width / 17,
        justifyContent: 'flex-end',
    },
    iconContainer: {
        width: height / 24,
        height: height / 48,
        borderBottomLeftRadius: height / 24,
        borderBottomRightRadius: height / 24,
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    banner: {
        borderTopLeftRadius: GENERAL.borderRadiusSmall,
        borderTopRightRadius: GENERAL.borderRadiusSmall,
        height: height / 24,
        alignItems: 'center',
        width: width / 1.36,
    },
});

class InfoBox extends Component {
    static propTypes = {
        secondaryBackgroundColor: PropTypes.string,
        containerStyle: PropTypes.object,
        backgroundColor: PropTypes.string,
    };

    static defaultProps = {
        secondaryBackgroundColor: 'white',
    };

    render() {
        const { containerStyle, secondaryBackgroundColor, text } = this.props;
        const isBackgroundWhite = secondaryBackgroundColor === 'white';
        const infoImagePath = isBackgroundWhite ? whiteInfoImagePath : blackInfoImagePath;
        const innerContainerBackgroundColor = isBackgroundWhite
            ? { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            : { backgroundColor: 'rgba(0, 0, 0, 0.05)' };
        const bannerBackgroundColor = isBackgroundWhite
            ? { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
            : { backgroundColor: 'rgba(0, 0, 0, 0.15)' };
        const iconContainerBackgroundColor = isBackgroundWhite
            ? { backgroundColor: 'rgba(255, 255, 255, 0.11)' }
            : { backgroundColor: 'rgba(0, 0, 0, 0.11)' };

        return (
            <View style={styles.fieldContainer}>
                <View style={[styles.banner, bannerBackgroundColor]} />
                <Image source={infoImagePath} style={styles.icon}>
                    <View style={[styles.iconContainer, iconContainerBackgroundColor]} />
                </Image>
                <View style={[styles.innerContainer, innerContainerBackgroundColor]}>{text}</View>
            </View>
        );
    }
}

export default InfoBox;
