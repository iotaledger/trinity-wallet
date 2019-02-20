import size from 'lodash/size';
import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MAX_SEED_TRITS, VALID_SEED_REGEX, getChecksum } from 'shared-modules/libs/iota/utils';
import PropTypes from 'prop-types';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';
import { isAndroid } from 'libs/device';
import { stringToUInt8, UInt8ToString } from 'libs/crypto';
import { trytesToTrits, tritsToChars } from 'shared-modules/libs/iota/converter';

const styles = StyleSheet.create({
    fieldContainer: {
        justifyContent: 'center',
    },
    fieldLabel: {
        fontSize: Styling.fontSize2,
        marginBottom: height / 100,
        marginLeft: 1,
        backgroundColor: 'transparent',
    },
    textInput: {
        fontSize: Styling.fontSize4,
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
        borderRadius: Styling.borderRadius,
        height: height / 14,
        borderWidth: 1,
    },
    widgetContainer: {
        borderLeftWidth: 2,
        justifyContent: 'center',
        marginVertical: height / 70,
        flex: 1,
    },
    conversionTextContainer: {
        right: width / 6.5,
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    conversionText: {
        fontSize: Styling.fontSize4,
        fontFamily: 'SourceSansPro-Light',
        backgroundColor: 'transparent',
    },
    widgetButton: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    denominationText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    passwordStrengthIndicatorContainer: {
        position: 'absolute',
        top: height / 150,
        right: 0,
        flexDirection: 'row',
    },
    passwordStrengthIndicator: {
        width: width / 15,
        height: height / 160,
        marginLeft: width / 150,
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    checksumContainer: {
        height: width / 18,
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 10,
        borderRightWidth: 1,
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderBottomLeftRadius: width / 60,
        borderBottomRightRadius: width / 60,
        position: 'absolute',
        right: width / 100,
        bottom: isAndroid ? -width / 19 : -width / 20,
    },
    checksumText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontsize1,
    },
    seedInput: {
        height: height / 7.4,
        justifyContent: 'flex-start',
    },
});

class CustomTextInput extends Component {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Label for text field */
        label: PropTypes.string,
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
        /** Determines whether password check widget should be illuminated */
        isPasswordValid: PropTypes.bool,
        /** Determines strength of password */
        passwordStrength: PropTypes.number,
        /** Determines whether text input is for seeds */
        isSeedInput: PropTypes.bool,
        /** Determines whether text input is for passwords */
        isPasswordInput: PropTypes.bool,
        /** Text input value */
        value: PropTypes.any,
        /** Text Change event callback function */
        onValidTextChange: PropTypes.func,
    };

    static defaultProps = {
        onFocus: () => {},
        onBlur: () => {},
        onFingerprintPress: () => {},
        containerStyle: { width: Styling.contentWidth },
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
        isPasswordValid: false,
        passwordStrength: 0,
        value: '',
        isSeedInput: false,
        isPasswordInput: false,
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

    /**
     * Triggered on text change - converts seed and password to appropriate format
     * @return {function}
     */
    onChangeText(value) {
        const { isPasswordInput, isSeedInput, onValidTextChange } = this.props;
        if (isSeedInput) {
            if (value && !value.match(VALID_SEED_REGEX)) {
                return;
            }
            return onValidTextChange(trytesToTrits(value));
        } else if (isPasswordInput) {
            return onValidTextChange(stringToUInt8(value));
        }
        onValidTextChange(value);
    }

    /**
     * Returns text input value - converts seed and password to string
     * @return {string}
     */
    getValue(value) {
        const { isSeedInput, isPasswordInput } = this.props;
        if (isSeedInput && value) {
            return tritsToChars(value);
        } else if (isPasswordInput && value) {
            return UInt8ToString(value);
        }
        return value;
    }

    /**
     * Gets the label style
     * @return {Object}
     */
    getLabelStyle() {
        const { theme } = this.props;
        const focusedFieldLabel = { color: theme.primary.color, fontFamily: 'SourceSansPro-Regular' };
        const unfocusedFieldLabel = { color: theme.body.color, fontFamily: 'SourceSansPro-Regular' };

        return this.state.isFocused ? focusedFieldLabel : unfocusedFieldLabel;
    }

    getChecksumValue() {
        const { value } = this.props;
        let checksumValue = '...';
        if (value === null) {
            return checksumValue;
        } else if (size(value) !== 0 && size(value) < MAX_SEED_TRITS) {
            checksumValue = '< 81';
        } else if (size(value) > MAX_SEED_TRITS) {
            checksumValue = '> 81';
        } else if (size(value) === MAX_SEED_TRITS) {
            checksumValue = getChecksum(tritsToChars(value)); // FIXME: Replace with trit checksum calculation
        }
        return checksumValue;
    }

    getChecksumStyle() {
        const { theme, value } = this.props;
        if (value && size(value) === MAX_SEED_TRITS) {
            return { color: theme.primary.color };
        }
        return { color: theme.body.color };
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

    /**
     * Renders a checkmark
     * @return {View}
     */
    renderPasswordCheck() {
        const { theme, containerStyle, isPasswordValid } = this.props;
        return (
            <View style={[styles.widgetContainer, { borderColor: 'transparent', opacity: isPasswordValid ? 1 : 0.3 }]}>
                <View style={styles.widgetButton}>
                    <Icon
                        name="tickRound"
                        size={containerStyle.width / 15}
                        color={isPasswordValid ? theme.input.color : theme.input.alt}
                    />
                </View>
            </View>
        );
    }

    /**
     * Renders the denomination text
     * @param  {Object} widgetBorderColor
     * @return {View}
     */
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

    /**
     * Renders a fingerprint icon
     * @param  {Object} widgetBorderColor
     * @return {View}
     */
    renderFingerprintAuthentication(widgetBorderColor) {
        const { theme, onFingerprintPress, containerStyle, widget } = this.props;
        return (
            <View style={[styles.widgetContainer, widgetBorderColor]}>
                <TouchableOpacity
                    onPress={() => onFingerprintPress()}
                    style={styles.widgetButton}
                    hitSlop={{ top: height / 60, bottom: height / 60, left: width / 75, right: width / 75 }}
                >
                    <Icon name={widget} size={containerStyle.width / 15} color={theme.input.alt} />
                </TouchableOpacity>
            </View>
        );
    }

    /**
     * Renders the currency conversion text
     * @param  {string} conversionText Value
     * @return {View}
     */
    renderCurrencyConversion(conversionText) {
        const { theme, height } = this.props;
        return (
            <View style={[styles.conversionTextContainer, { height }]}>
                <Text style={[styles.conversionText, { color: theme.input.alt }]}>{conversionText}</Text>
            </View>
        );
    }

    render() {
        const {
            label,
            theme,
            containerStyle,
            widget,
            onRef,
            testID,
            height,
            conversionText,
            currencyConversion,
            innerPadding,
            fingerprintAuthentication,
            isPasswordValid,
            passwordStrength,
            isSeedInput,
            value,
            ...restProps
        } = this.props;
        const { isFocused } = this.state;
        return (
            <View style={[styles.fieldContainer, containerStyle, isSeedInput && styles.seedInput]}>
                {label && (
                    <View style={styles.labelContainer}>
                        <Text style={[styles.fieldLabel, this.getLabelStyle()]}>{label.toUpperCase()}</Text>
                        {widget === 'password' && (
                            <View style={styles.passwordStrengthIndicatorContainer}>
                                <View
                                    style={[
                                        styles.passwordStrengthIndicator,
                                        {
                                            backgroundColor: isPasswordValid
                                                ? theme.positive.color
                                                : passwordStrength < 1 ? theme.body.alt : theme.negative.color,
                                        },
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.passwordStrengthIndicator,
                                        {
                                            backgroundColor: isPasswordValid
                                                ? theme.positive.color
                                                : passwordStrength < 2 ? theme.body.alt : theme.negative.color,
                                        },
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.passwordStrengthIndicator,
                                        {
                                            backgroundColor: isPasswordValid
                                                ? theme.positive.color
                                                : passwordStrength < 3 ? theme.body.alt : theme.negative.color,
                                        },
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.passwordStrengthIndicator,
                                        {
                                            backgroundColor: isPasswordValid ? theme.positive.color : theme.body.alt,
                                        },
                                    ]}
                                />
                            </View>
                        )}
                    </View>
                )}
                <View
                    style={[
                        styles.innerContainer,
                        {
                            backgroundColor: theme.input.bg,
                            borderColor: isFocused ? theme.input.hover : theme.input.border,
                        },
                        { height },
                    ]}
                    testID={testID}
                >
                    <TextInput
                        {...restProps}
                        ref={onRef}
                        style={[styles.textInput, { color: theme.input.color }]}
                        onFocus={() => this.onFocus()}
                        onBlur={() => this.onBlur()}
                        onChangeText={(text) => this.onChangeText(text)}
                        selectionColor={theme.input.alt}
                        underlineColorAndroid="transparent"
                        value={this.getValue(value)}
                    />
                    {(widget === 'qr' && this.renderQR({ borderLeftColor: theme.input.alt })) ||
                        (widget === 'denomination' && this.renderDenomination({ borderLeftColor: theme.input.alt })) ||
                        ((widget === 'password' || widget === 'passwordReentry') && this.renderPasswordCheck())}
                    {currencyConversion && this.renderCurrencyConversion(conversionText)}
                    {fingerprintAuthentication &&
                        this.renderFingerprintAuthentication({ borderLeftColor: theme.input.alt })}
                </View>
                {isSeedInput && (
                    <View style={{ width: containerStyle.width, alignItems: 'flex-end' }}>
                        <View
                            style={[
                                styles.checksumContainer,
                                {
                                    backgroundColor: theme.input.bg,
                                    borderColor: isFocused ? theme.input.hover : theme.input.border,
                                },
                            ]}
                        >
                            <Text style={[this.getChecksumStyle(), styles.checksumText]}>
                                {this.getChecksumValue()}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        );
    }
}

export default CustomTextInput;
