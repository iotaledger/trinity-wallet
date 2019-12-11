import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Icon from 'ui/theme/icons';
import { Checksum } from 'ui/components/Checksum';
import { isAndroid } from 'libs/device';
import { stringToUInt8, UInt8ToString } from 'libs/crypto';
import { trytesToTrits, tritsToChars } from 'shared-modules/libs/iota/converter';
import { VALID_SEED_REGEX } from 'shared-modules/libs/iota/utils';

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
        marginRight: width / 28,
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
    activityIndicator: {
        justifyContent: 'center',
        alignItems: 'center',
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
        /** Array to render appropriate widgets for text field */
        widgets: PropTypes.array,
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
        /** Determines whether to mask text by default */
        secureTextEntry: PropTypes.bool,
        /** Determines whether to display loading spinner */
        loading: PropTypes.bool,
        /** Determines whether to disable the text input */
        disabled: PropTypes.bool,
    };

    static defaultProps = {
        onFingerprintPress: () => {},
        containerStyle: { width: Styling.contentWidth },
        widgets: [],
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
        passwordStrength: null,
        value: '',
        isSeedInput: false,
        isPasswordInput: false,
        loading: false,
        disabled: false,
    };

    constructor(props) {
        super();
        this.state = {
            isFocused: false,
            isSecretMasked: props.widgets.indexOf('mask') > -1,
        };
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
     * Masks or unmasks secret
     */
    onSecretMaskPress() {
        const { isSecretMasked } = this.state;
        this.setState({ isSecretMasked: !isSecretMasked });
    }

    /**
     * Returns chosen widget render function
     * Note: Maximum of 2 widgets can be rendered
     * @return {function}
     */
    getWidgetRenderFunction(widget) {
        switch (widget) {
            case 'checkMark':
                return this.renderPasswordCheck();
            case 'denomination':
                return this.renderDenomination();
            case 'fingerprint':
                return this.renderFingerprintAuthentication(true);
            case 'fingerprintDisabled':
                return this.renderFingerprintAuthentication(false);
            case 'qr':
                return this.renderQR();
            case 'mask':
                return this.renderSecretMask();
        }
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

    renderQR() {
        const { theme, onQRPress, containerStyle } = this.props;
        return (
            <TouchableOpacity
                onPress={() => onQRPress()}
                style={styles.widgetButton}
                hitSlop={{ top: height / 60, bottom: height / 60, left: width / 75, right: width / 75 }}
            >
                <Icon name="camera" size={containerStyle.width / 17} color={theme.input.alt} />
            </TouchableOpacity>
        );
    }

    /**
     * Renders a secret mask button
     * @return {View}
     */
    renderSecretMask() {
        const { theme, containerStyle } = this.props;
        return (
            <TouchableOpacity
                onPress={() => this.onSecretMaskPress()}
                style={styles.widgetButton}
                hitSlop={{ top: height / 60, bottom: height / 60, left: width / 75, right: width / 75 }}
            >
                <Icon
                    name={this.state.isSecretMasked ? 'eyeSlash' : 'eye'}
                    size={containerStyle.width / 17}
                    color={theme.input.alt}
                />
            </TouchableOpacity>
        );
    }

    /**
     * Renders a checkmark
     * @return {View}
     */
    renderPasswordCheck() {
        const { theme, containerStyle, isPasswordValid } = this.props;
        return (
            <View style={[styles.widgetButton, { opacity: isPasswordValid ? 1 : 0.3 }]}>
                <Icon
                    name="tickRound"
                    size={containerStyle.width / 17}
                    color={isPasswordValid ? theme.input.color : theme.input.alt}
                />
            </View>
        );
    }

    /**
     * Renders denomination text
     */
    renderDenomination() {
        const { theme, onDenominationPress, denominationText } = this.props;
        return (
            <TouchableOpacity
                onPress={() => onDenominationPress()}
                style={styles.widgetButton}
                hitSlop={{ top: height / 60, bottom: height / 60, left: width / 75, right: width / 75 }}
            >
                <Text style={[styles.denominationText, { color: theme.input.alt }]}>{denominationText}</Text>
            </TouchableOpacity>
        );
    }

    /**
     * Renders a fingerprint icon
     * @return {View}
     */
    renderFingerprintAuthentication(enabled = true) {
        const { theme, onFingerprintPress, containerStyle } = this.props;
        return (
            <TouchableOpacity
                onPress={() => onFingerprintPress()}
                style={styles.widgetButton}
                hitSlop={{ top: height / 60, bottom: height / 60, left: width / 75, right: width / 75 }}
            >
                <Icon
                    name={enabled ? 'fingerprint' : 'fingerprintDisabled'}
                    size={containerStyle.width / 17}
                    color={theme.input.alt}
                />
            </TouchableOpacity>
        );
    }

    /**
     * Renders the currency conversion text
     * @return {View}
     */
    renderCurrencyConversion() {
        const { theme, height, conversionText } = this.props;
        return (
            <View style={[styles.conversionTextContainer, { height }]}>
                <Text style={[styles.conversionText, { color: theme.input.alt }]}>{conversionText}</Text>
            </View>
        );
    }

    /**
     * Renders checksum component
     * @return {View}
     */
    renderChecksumComponent() {
        const { theme, containerStyle, value } = this.props;
        return (
            <View style={{ width: containerStyle.width, alignItems: 'flex-end' }}>
                <View
                    style={[
                        styles.checksumContainer,
                        {
                            backgroundColor: theme.input.bg,
                            borderColor: this.state.isFocused ? theme.input.hover : theme.input.bg,
                        },
                    ]}
                >
                    <Text style={[Checksum.getStyle(theme, value), styles.checksumText]}>
                        {Checksum.getValue(value)}
                    </Text>
                </View>
            </View>
        );
    }

    /**
     * Renders password strength indicator
     * @return {View}
     */
    renderPasswordStrengthIndicator() {
        const { theme, isPasswordValid, passwordStrength } = this.props;
        return (
            <View style={styles.passwordStrengthIndicatorContainer}>
                <View
                    style={[
                        styles.passwordStrengthIndicator,
                        {
                            backgroundColor: isPasswordValid
                                ? theme.positive.color
                                : passwordStrength < 1
                                ? theme.body.alt
                                : theme.negative.color,
                        },
                    ]}
                />
                <View
                    style={[
                        styles.passwordStrengthIndicator,
                        {
                            backgroundColor: isPasswordValid
                                ? theme.positive.color
                                : passwordStrength < 2
                                ? theme.body.alt
                                : theme.negative.color,
                        },
                    ]}
                />
                <View
                    style={[
                        styles.passwordStrengthIndicator,
                        {
                            backgroundColor: isPasswordValid
                                ? theme.positive.color
                                : passwordStrength < 3
                                ? theme.body.alt
                                : theme.negative.color,
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
        );
    }

    /**
     * Renders loading spinner
     * @return {View}
     */
    renderLoadingSpinner() {
        const { theme } = this.props;
        return (
            <View style={styles.widgetContainer}>
                <ActivityIndicator
                    animating
                    style={styles.activityIndicator}
                    size="small"
                    color={theme.primary.color}
                />
            </View>
        );
    }

    /**
     * Renders left hand widget, if two are specificed
     * @return {View}
     */
    renderLeftHandWidget() {
        return (
            <View style={[styles.widgetContainer, { flex: 1.2 }]}>
                {this.getWidgetRenderFunction(this.props.widgets[1])}
            </View>
        );
    }

    /**
     * Renders right hand widget
     * @return {View}
     */
    renderRightHandWidget() {
        const { theme } = this.props;
        return (
            <View style={[styles.widgetContainer, { borderLeftWidth: 0.5, borderLeftColor: theme.input.alt }]}>
                {this.getWidgetRenderFunction(this.props.widgets[0])}
            </View>
        );
    }

    render() {
        const {
            label,
            theme,
            containerStyle,
            widgets,
            onRef,
            testID,
            height,
            currencyConversion,
            passwordStrength,
            isSeedInput,
            secureTextEntry,
            value,
            loading,
            disabled,
            ...restProps
        } = this.props;
        const { isFocused, isSecretMasked } = this.state;

        return (
            <View
                style={[
                    styles.fieldContainer,
                    containerStyle,
                    isSeedInput && styles.seedInput,
                    { opacity: disabled ? 0.4 : 1 },
                ]}
            >
                {label && (
                    <View style={styles.labelContainer}>
                        <Text style={[styles.fieldLabel, this.getLabelStyle()]}>{label.toUpperCase()}</Text>
                        {typeof passwordStrength === 'number' && this.renderPasswordStrengthIndicator()}
                    </View>
                )}
                <View
                    style={[
                        styles.innerContainer,
                        {
                            backgroundColor: theme.input.bg,
                            borderColor: isFocused ? theme.input.hover : theme.input.bg,
                        },
                        { height },
                    ]}
                    testID={testID}
                >
                    {widgets.length === 2 && this.renderLeftHandWidget()}
                    <TextInput
                        ref={onRef}
                        style={[
                            styles.textInput,
                            { color: theme.input.color, marginLeft: widgets.length === 2 ? 0 : width / 28 },
                        ]}
                        onFocus={() => this.onFocus()}
                        onBlur={() => this.onBlur()}
                        secureTextEntry={secureTextEntry || isSecretMasked}
                        onChangeText={(text) => this.onChangeText(text)}
                        selectionColor={theme.input.alt}
                        underlineColorAndroid="transparent"
                        value={this.getValue(value)}
                        editable={!disabled}
                        selectTextOnFocus={!disabled}
                        {...restProps}
                    />
                    {!loading && widgets.length > 0 && this.renderRightHandWidget()}
                    {loading && this.renderLoadingSpinner()}
                    {currencyConversion && this.renderCurrencyConversion()}
                </View>
                {isSeedInput && this.renderChecksumComponent()}
            </View>
        );
    }
}

export default CustomTextInput;
