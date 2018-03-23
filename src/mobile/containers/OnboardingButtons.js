import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    leftButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    rightButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    leftText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    rightText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
});

class OnboardingButtons extends PureComponent {
    static propTypes = {
        buttonWidth: PropTypes.object,
        containerWidth: PropTypes.object,
        primary: PropTypes.object,
        secondary: PropTypes.object,
        opacity: PropTypes.number,
        leftButtonTestID: PropTypes.string,
        rightButtonTestID: PropTypes.string,
        leftText: PropTypes.string.isRequired,
        rightText: PropTypes.string.isRequired,
        onLeftButtonPress: PropTypes.func.isRequired,
        onRightButtonPress: PropTypes.func.isRequired,
    };

    static defaultProps = {
        buttonWidth: { width: width / 2.7 },
        containerWidth: { width: width / 1.2 },
    };

    render() {
        const { primary, secondary, opacity, buttonWidth, containerWidth } = this.props;
        const rightTextColor = { color: primary.color };
        const rightBorderColor = { borderColor: primary.color };
        const leftTextColor = { color: secondary.color };
        const leftBorderColor = { borderColor: secondary.color };
        const rightButtonOpacity = { opacity };

        return (
            <View style={[styles.buttonsContainer, containerWidth]}>
                <TouchableOpacity onPress={() => this.props.onLeftButtonPress()} testID={this.props.leftButtonTestID}>
                    <View style={[styles.leftButton, buttonWidth, leftBorderColor]}>
                        <Text style={[styles.leftText, leftTextColor]}>{this.props.leftText}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.props.onRightButtonPress()} testID={this.props.rightButtonTestID}>
                    <View style={[styles.rightButton, buttonWidth, rightBorderColor, rightButtonOpacity]}>
                        <Text style={[styles.rightText, rightTextColor]}>{this.props.rightText}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    primary: state.settings.theme.primary,
    secondary: state.settings.theme.secondary,
});

export default connect(mapStateToProps)(OnboardingButtons);
