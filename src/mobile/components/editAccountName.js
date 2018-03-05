import trim from 'lodash/trim';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { translate } from 'react-i18next';
import CustomTextInput from './customTextInput';
import { width, height } from '../util/dimensions';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textFieldContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: height / 10,
    },
    saveText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    saveButtonContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topContainer: {
        flex: 9,
        justifyContent: 'space-around',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

export class EditAccountName extends Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        accountName: PropTypes.string.isRequired,
        saveAccountName: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
        textColor: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            accountName: props.accountName,
        };
    }

    componentWillReceiveProps(newProps) {
        if (this.props.accountName !== newProps.accountName) {
            this.setState({ accountName: newProps.accountName });
        }
    }

    render() {
        const { t, textColor, secondaryBackgroundColor, negativeColor } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={styles.textFieldContainer}>
                            <CustomTextInput
                                label={t('accountName')}
                                onChangeText={(accountName) => this.setState({ accountName })}
                                containerStyle={{ width: width / 1.2 }}
                                autoCapitalize="none"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                onSubmitEditing={() => this.props.saveAccountName(trim(this.state.accountName))}
                                secondaryBackgroundColor={secondaryBackgroundColor}
                                negativeColor={negativeColor}
                                value={this.state.accountName}
                            />
                        </View>
                        <View style={styles.saveButtonContainer} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.backPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={secondaryBackgroundColor} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.props.saveAccountName(trim(this.state.accountName))}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:save')}</Text>
                                <Icon name="eye" size={width / 28} color={secondaryBackgroundColor} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['addAdditionalSeed', 'global'])(EditAccountName);
