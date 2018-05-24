import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import { isAndroid } from '../utils/device';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    fieldContainer: {
        justifyContent: 'center',
    },
    fieldLabel: {
        fontSize: GENERAL.fontSize2,
        marginBottom: height / 100,
        marginLeft: 1,
    },
    textInput: {
        fontSize: GENERAL.fontSize4,
        fontFamily: 'SourceSansPro-Light',
        flex: 6,
        marginHorizontal: width / 28,
        paddingTop: 0,
        paddingBottom: 0,
        height: height / 14,
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
        fontSize: GENERAL.fontSize4,
        fontFamily: 'SourceSansPro-Light',
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
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
});

class CustomTextInput extends Component {
    static propTypes = {
        /** Text Change event callback function */
        /** @param {string} text - Updated text in the text field */
        onChangeText: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Label for text field */
        label: PropTypes.string.isRequired,
        /** Focus event callback function */
        onFocus: PropTypes.func,
        /** Blur event callback function */
        onBlur: PropTypes.func,
        /** Text field container view styles */
        containerStyle: PropTypes.object,
        /** String to render appropriate icon for text field */
        widget: PropTypes.string,
        /** Press event (denomination widget) callback function */
        onDenominationPress: PropTypes.func,
        /** Denomination widget text */
        denominationText: PropTypes.string,
        /** Press event (Qr widget) callback function */
        onQRPress: PropTypes.func,
        /** Boolean for displaying fingerprint widget */
        fingerprintAuthentication: PropTypes.bool,
        /** Press event (Fingerprint widget) callback function */
        onFingerprintPress: PropTypes.func,
        /** Text field inner padding */
        innerPadding: PropTypes.object,
        /** Boolean for displaying currency conversion text */
        currencyConversion: PropTypes.bool,
        /** Currency conversion text */
        conversionText: PropTypes.string,
        /** Text field height */
        height: PropTypes.number,
        /** Callback function returning text field instance as an argument */
        /** @param {object} instance - text field instance
         */
        onRef: PropTypes.func,
        /** Id for automated screenshots */
        testID: PropTypes.string,
        /** Checks to see if the user is about to paste an address */
        detectAddressInClipboard: PropTypes.func,
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
        bodyColor: 'white',
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
        if (this.props.detectAddressInClipboard){
            this.props.detectAddressInClipboard();
        }
    }

    onBlur() {
        this.setState({ isFocused: false });
    }

    getLabelStyle() {
        const { theme } = this.props;
        const focusedFieldLabel = { color: theme.primary.color, fontFamily: 'SourceSansPro-Regular' };
        const unfocusedFieldLabel = { color: theme.body.color, fontFamily: 'SourceSansPro-Regular' };

        return this.state.isFocused ? focusedFieldLabel : unfocusedFieldLabel;
    }

    renderQR(widgetBorderColor) {
        const { theme, onQRPress, containerStyle } = this.props;
        return (
            <View style={[styles.widgetContainer, widgetBorderColor]}>
                <TouchableOpacity
                    onPress={() => onQRPress()}
                    style={styles.widgetButton}
                    hitSlop={{ top: height / 60, bottom: height / 60, left: width / 75, right: width / 75 }}
                >
                    <Icon name="camera" size={containerStyle.width / 15} color={theme.input.alt} />
                </TouchableOpacity>
            </View>
        );
    }

    renderDenomination(widgetBorderColor) {
        const { theme, onDenominationPress, denominationText } = this.props;
        return (
            <View style={[styles.widgetContainer, widgetBorderColor]}>
                <TouchableOpacity
                    onPress={() => onDenominationPress()}
                    style={styles.widgetButton}
                    hitSlop={{ top: height / 60, bottom: height / 60, left: width / 75, right: width / 75 }}
                >
                    <Text style={[styles.denominationText, { color: theme.input.alt }]}>{denominationText}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderFingerprintAuthentication(widgetBorderColor) {
        const { theme, onFingerprintPress, containerStyle } = this.props;

        return (
            <View style={[styles.widgetContainer, widgetBorderColor]}>
                <TouchableOpacity
                    onPress={() => onFingerprintPress()}
                    style={styles.widgetButton}
                    hitSlop={{ top: height / 60, bottom: height / 60, left: width / 75, right: width / 75 }}
                >
                    <Icon name="fingerprint" size={containerStyle.width / 15} color={theme.input.alt} />
                </TouchableOpacity>
            </View>
        );
    }

    renderCurrencyConversion(conversionText) {
        const { theme } = this.props;

        return <Text style={[styles.conversionText, { color: theme.input.alt }]}>{conversionText}</Text>;
    }

    render() {
        const {
            label,
            theme,
            onChangeText,
            containerStyle,
            widget,
            onRef,
            testID,
            height,
            conversionText,
            currencyConversion,
            innerPadding,
            fingerprintAuthentication,
            ...restProps
        } = this.props;

        return (
            <View style={[styles.fieldContainer, containerStyle]}>
                <Text style={[styles.fieldLabel, this.getLabelStyle()]}>{label.toUpperCase()}</Text>
                <View style={[styles.innerContainer, { backgroundColor: theme.input.bg }, { height }]} testID={testID}>
                    <TextInput
                        {...restProps}
                        ref={onRef}
                        style={[styles.textInput, { color: theme.input.color }]}
                        onFocus={() => this.onFocus()}
                        onBlur={() => this.onBlur()}
                        onChangeText={onChangeText}
                        selectionColor={theme.label.hover}
                        underlineColorAndroid="transparent"
                    />
                    {(widget === 'qr' && this.renderQR({ borderLeftColor: theme.input.alt })) ||
                        (widget === 'denomination' && this.renderDenomination({ borderLeftColor: theme.input.alt }))}
                    {currencyConversion && this.renderCurrencyConversion(conversionText)}
                    {fingerprintAuthentication &&
                        this.renderFingerprintAuthentication({ borderLeftColor: theme.input.alt })}
                </View>
            </View>
        );
    }
}

export default CustomTextInput;
