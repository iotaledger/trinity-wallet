import React from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import whiteQRImagePath from 'iota-wallet-shared-modules/images/qr-white.png';
import blackQRImagePath from 'iota-wallet-shared-modules/images/qr-black.png';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';
import THEMES from '../theme/themes';

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
        lineHeight: width / 23,
        fontFamily: 'Lato-Light',
        flex: 6,
        marginHorizontal: width / 28,
    },
    innerContainer: {
        flexDirection: 'row',
        borderRadius: GENERAL.borderRadiusSmall,
        height: height / 15,
        paddingVertical: height / 140,
    },
    widgetContainer: {
        borderLeftWidth: 2,
        justifyContent: 'center',
        marginVertical: height / 120,
        flex: 1,
    },
    QRImage: {},
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
        negativeColor: PropTypes.object,
    };

    static defaultProps = {
        onFocus: () => {},
        onBlur: () => {},
        containerStyle: {},
        widget: 'empty',
        onDenominationPress: () => {},
        onQRPress: () => {},
        denominationText: 'i',
        secondaryBackgroundColor: 'white',
        negativeColor: {
            h: 50.44897959183674,
            s: 0.9839357429718876,
            l: 0.48823529411764705,
            a: 1,
        },
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
        const focusedFieldLabel = { color: THEMES.getHSL(negativeColor), fontFamily: 'Lato-Regular' };
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

    render() {
        const {
            label,
            onChangeText,
            containerStyle,
            widget,
            secondaryBackgroundColor,
            negativeColor,
            onRef,
            height,
            fontSize,
            lineHeight,
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
                <View style={[styles.innerContainer, innerContainerBackgroundColor, height]}>
                    <TextInput
                        {...restProps}
                        ref={onRef}
                        style={[styles.textInput, textInputColor, fontSize, lineHeight]}
                        onFocus={() => this.onFocus()}
                        onBlur={() => this.onBlur()}
                        onChangeText={onChangeText}
                        selectionColor={THEMES.getHSL(negativeColor)}
                        underlineColorAndroid={'transparent'}
                    />
                    {(widget === 'qr' && this.renderQR(widgetBorderColor)) ||
                        (widget === 'denomination' && this.renderDenomination(widgetBorderColor))}
                </View>
            </View>
        );
    }
}

export default CustomTextInput;
