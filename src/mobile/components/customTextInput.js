import React from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import whiteQrImagePath from 'iota-wallet-shared-modules/images/qr-white.png';
import blackQrImagePath from 'iota-wallet-shared-modules/images/qr-black.png';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';
import THEMES from '../theme/themes';

const styles = StyleSheet.create({
    fieldContainer: {
        justifyContent: 'center',
    },
    fieldLabel: {
        fontSize: width / 34.5,
        marginVertical: height / 70,
        marginLeft: 1,
    },
    textInput: {
        fontSize: width / 23,
        lineHeight: width / 23,
        fontFamily: 'Lato-Light',
        color: 'white',
        flex: 6,
    },
    innerContainer: {
        flexDirection: 'row',
        borderRadius: GENERAL.borderRadiusSmall,
        paddingLeft: width / 35,
        height: height / 14,
    },
    widgetContainer: {
        borderLeftWidth: 2,
        borderLeftColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        marginVertical: height / 120,
        flex: 1,
    },
    qrImage: {},
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
        secondaryBackgroundColor: PropTypes.string.isRequired,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        containerStyle: PropTypes.object,
        widget: PropTypes.string,
        onDenominationPress: PropTypes.func,
        denominationText: PropTypes.string,
        onQrPress: PropTypes.func,
        onRef: PropTypes.func,
        negativeColor: PropTypes.object.isRequired,
        backgroundColor: PropTypes.string.isRequired,
    };

    static defaultProps = {
        onFocus: () => {},
        onBlur: () => {},
        containerStyle: {},
        widget: 'empty',
        onDenominationPress: () => {},
        onQrPress: () => {},
        denominationText: 'i',
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

    renderQR() {
        const { secondaryBackgroundColor, onQrPress, containerStyle } = this.props;
        const qrImagePath = secondaryBackgroundColor === 'white' ? whiteQrImagePath : blackQrImagePath;
        const qrImageSize = { width: containerStyle.width / 15, height: containerStyle.width / 15 };
        return (
            <View style={styles.widgetContainer}>
                <TouchableOpacity onPress={() => onQrPress()} style={styles.widgetButton}>
                    <Image source={qrImagePath} style={[styles.qrImage, qrImageSize]} />
                </TouchableOpacity>
            </View>
        );
    }

    renderDenomination() {
        const { secondaryBackgroundColor, onDenominationPress, denominationText } = this.props;
        return (
            <View style={styles.widgetContainer}>
                <TouchableOpacity onPress={() => onDenominationPress()} style={styles.widgetButton}>
                    <Text style={[styles.denominationText, { color: secondaryBackgroundColor }]}>
                        {denominationText}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        const { label, onChangeText, containerStyle, widget, backgroundColor, ...restProps } = this.props;
        const innerContainerBackgroundColor = { backgroundColor };
        return (
            <View style={[styles.fieldContainer, containerStyle]}>
                <Text style={[styles.fieldLabel, this.getLabelStyle()]}>{label.toUpperCase()}</Text>
                <View style={[styles.innerContainer, innerContainerBackgroundColor]}>
                    <TextInput
                        {...restProps}
                        style={styles.textInput}
                        onFocus={() => this.onFocus()}
                        onBlur={() => this.onBlur()}
                        onChangeText={onChangeText}
                    />
                    {(widget === 'qr' && this.renderQR()) || (widget === 'denomination' && this.renderDenomination())}
                </View>
            </View>
        );
    }
}

export default CustomTextInput;
