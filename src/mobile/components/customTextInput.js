import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';
import { isAndroid } from '../util/device';
import { Icon } from '../theme/icons.js';

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
        onChangeText: PropTypes.func.isRequired,
        theme: PropTypes.object.isRequired,
        label: PropTypes.string,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        containerStyle: PropTypes.object,
        widget: PropTypes.string,
        onDenominationPress: PropTypes.func,
        denominationText: PropTypes.string,
        onQRPress: PropTypes.func,
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
    }

    onBlur() {
        this.setState({ isFocused: false });
    }

    getLabelStyle() {
        const { theme } = this.props;
        const focusedFieldLabel = { color: theme.primary.color, fontFamily: 'Lato-Regular' };
        const unfocusedFieldLabel = { color: theme.body.color, fontFamily: 'Lato-Regular' };

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
                    <Icon name="eye" size={containerStyle.width / 15} color={theme.input.alt} />
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
                        selectionColor={label.hover}
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
