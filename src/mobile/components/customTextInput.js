import React from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import whiteQRImagePath from 'iota-wallet-shared-modules/images/qr-white.png';
import blackQRImagePath from 'iota-wallet-shared-modules/images/qr-black.png';
import whiteFingerprintImagePath from 'iota-wallet-shared-modules/images/fingerprint-icon-white.png';
import blackFingerprintImagePath from 'iota-wallet-shared-modules/images/fingerprint-icon-black.png';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';
import { isAndroid } from '../util/device';

const styles = StyleSheet.create({
    fieldContainer: {
        justifyContent: 'center',
    },
    fieldLabel: {
        fontSize: width / 34.5,
        marginBottom: height / 100,
        marginLeft: 1,
    },
    textInput: {
        fontSize: width / 23,
        fontFamily: 'Lato-Light',
        flex: 6,
        marginHorizontal: width / 28,
        paddingTop: 0,
        paddingBottom: 0,
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: GENERAL.borderRadiusSmall,
        height: height / 14,
    },
    widgetContainer: {
        borderLeftWidth: 2,
        justifyContent: 'center',
        marginVertical: height / 70,
        flex: 1,
    },
    conversionText: {
        fontSize: width / 23,
        fontFamily: 'Lato-Light',
        backgroundColor: 'transparent',
        position: 'absolute',
        top: isAndroid ? height / 60 : height / 49,
        right: width / 7.5,
    },
    widgetButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    denominationText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 29.6,
        backgroundColor: 'transparent',
    },
});

class CustomTextInput extends React.Component {
    static propTypes = {
        label: PropTypes.string.isRequired,
        onChangeText: PropTypes.func.isRequired,
        secondaryBackgroundColor: PropTypes.string,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        containerStyle: PropTypes.object,
        widget: PropTypes.string,
        onDenominationPress: PropTypes.func,
        denominationText: PropTypes.string,
        onQRPress: PropTypes.func,
        negativeColor: PropTypes.string,
        testID: PropTypes.string,
        onFingerprintPress: PropTypes.func,
        innerPadding: PropTypes.object,
        currencyConversion: PropTypes.bool,
        fingerprintAuthentication: PropTypes.bool,
        conversionText: PropTypes.string,
        height: PropTypes.number,
        onRef: PropTypes.func,
    };

    static defaultProps = {
        onFocus: () => {},
        onBlur: () => {},
        onFingerprintPress: () => {},
        containerStyle: {},
        widget: 'empty',
        onDenominationPress: () => {},
        onQRPress: () => {},
        denominationText: 'i',
        secondaryBackgroundColor: 'white',
        negativeColor: '#F7D002',
        innerPadding: null,
        currencyConversion: false,
        conversionText: '',
        height: height / 14,
        fingerprintAuthentication: false,
        testID: '',
        onRef: () => {},
    };

    constructor(props) {
        super(props);

        this.state = { isFocused: false };
    }

    componentDidMount() {
        if (this.props.onRef) {
            this.props.onRef(this);
        }
    }
    componentWillUnmount() {
        if (this.props.onRef) {
            this.props.onRef(null);
        }
    }

    onFocus() {
        this.setState({ isFocused: true });
    }

    onBlur() {
        this.setState({ isFocused: false });
    }

    getLabelStyle() {
        const { negativeColor, secondaryBackgroundColor } = this.props;
        const focusedFieldLabel = { color: negativeColor, fontFamily: 'Lato-Regular' };
        const unfocusedFieldLabel = { color: secondaryBackgroundColor, fontFamily: 'Lato-Regular' };

        return this.state.isFocused ? focusedFieldLabel : unfocusedFieldLabel;
    }

    renderQR(widgetBorderColor) {
        const { secondaryBackgroundColor, onQRPress, containerStyle } = this.props;
        const QRImagePath = secondaryBackgroundColor === 'white' ? whiteQRImagePath : blackQRImagePath;
        const QRImageSize = { width: containerStyle.width / 15, height: containerStyle.width / 15 };
        return (
            <View style={[styles.widgetContainer, widgetBorderColor]}>
                <TouchableOpacity onPress={() => onQRPress()} style={styles.widgetButton}>
                    <Image source={QRImagePath} style={[styles.QRImage, QRImageSize]} />
                </TouchableOpacity>
            </View>
        );
    }

    renderDenomination(widgetBorderColor) {
        const { secondaryBackgroundColor, onDenominationPress, denominationText } = this.props;
        return (
            <View style={[styles.widgetContainer, widgetBorderColor]}>
                <TouchableOpacity onPress={() => onDenominationPress()} style={styles.widgetButton}>
                    <Text style={[styles.denominationText, { color: secondaryBackgroundColor }]}>
                        {denominationText}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderFingerprintAuthentication(widgetBorderColor) {
        const { secondaryBackgroundColor, onFingerprintPress, containerStyle } = this.props;
        const fingerprintImagePath =
            secondaryBackgroundColor === 'white' ? whiteFingerprintImagePath : blackFingerprintImagePath;
        const fingerprintImageSize = { width: containerStyle.width / 13, height: containerStyle.width / 13 };

        return (
            <View style={[styles.widgetContainer, widgetBorderColor]}>
                <TouchableOpacity onPress={() => onFingerprintPress()} style={styles.widgetButton}>
                    <Image source={fingerprintImagePath} style={[styles.fingerprintImage, fingerprintImageSize]} />
                </TouchableOpacity>
            </View>
        );
    }

    renderCurrencyConversion(conversionText) {
        const { secondaryBackgroundColor } = this.props;
        const isWhite = secondaryBackgroundColor === 'white';
        const textColor = isWhite ? { color: 'white' } : { color: 'black' };

        return <Text style={[styles.conversionText, textColor]}>{conversionText}</Text>;
    }

    render() {
        const {
            label,
            onChangeText,
            containerStyle,
            widget,
            secondaryBackgroundColor,
            negativeColor,
            onRef,
            testID,
            height,
            conversionText,
            currencyConversion,
            innerPadding,
            fingerprintAuthentication,
            ...restProps
        } = this.props;
        const isWhite = secondaryBackgroundColor === 'white';
        const innerContainerBackgroundColor = isWhite
            ? { backgroundColor: 'rgba(255, 255, 255, 0.15)' }
            : { backgroundColor: 'rgba(0, 0, 0, 0.08)' };
        const textInputColor = isWhite ? { color: 'white' } : { color: 'black' };
        const widgetBorderColor = isWhite
            ? { borderLeftColor: 'rgba(255, 255, 255, 0.2)' }
            : { borderLeftColor: 'rgba(0, 0, 0, 1)' };
        return (
            <View style={[styles.fieldContainer, containerStyle]}>
                <Text style={[styles.fieldLabel, this.getLabelStyle()]}>{label.toUpperCase()}</Text>
                <View style={[styles.innerContainer, innerContainerBackgroundColor, { height }]} testID={testID}>
                    <TextInput
                        {...restProps}
                        ref={onRef}
                        style={[styles.textInput, textInputColor]}
                        onFocus={() => this.onFocus()}
                        onBlur={() => this.onBlur()}
                        onChangeText={onChangeText}
                        selectionColor={negativeColor}
                        underlineColorAndroid={'transparent'}
                    />
                    {(widget === 'qr' && this.renderQR(widgetBorderColor)) ||
                        (widget === 'denomination' && this.renderDenomination(widgetBorderColor))}
                    {currencyConversion && this.renderCurrencyConversion(conversionText)}
                    {fingerprintAuthentication && this.renderFingerprintAuthentication(widgetBorderColor)}
                </View>
            </View>
        );
    }
}

export default CustomTextInput;
