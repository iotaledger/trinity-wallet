import trim from 'lodash/trim';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, View, Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';
import THEMES from '../theme/themes';
import { translate } from 'react-i18next';

export class EditAccountName extends Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seedIndex: PropTypes.number.isRequired,
        accountName: PropTypes.string.isRequired,
        saveAccountName: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
        textColor: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
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
        const { t, textColor, secondaryBackgroundColor, arrowLeftImagePath, tickImagePath } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={styles.textFieldContainer}>
                            <TextField
                                style={{ color: secondaryBackgroundColor, fontFamily: 'Lato-Light' }}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={width / 31.8}
                                fontSize={width / 20.7}
                                labelPadding={3}
                                baseColor={secondaryBackgroundColor}
                                label={t('accountName')}
                                tintColor={THEMES.getHSL(this.props.negativeColor)}
                                autoCapitalize="words"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically={true}
                                returnKeyType="done"
                                value={this.state.accountName}
                                onChangeText={accountName => this.setState({ accountName })}
                                containerStyle={{
                                    width: width / 1.4,
                                }}
                                onSubmitEditing={() => this.props.saveAccountName(trim(this.state.accountName))}
                            />
                        </View>
                        <View style={styles.saveButtonContainer} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={event => this.props.backPress()}>
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.iconLeft} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.saveAccountName(trim(this.state.accountName))}>
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:save')}</Text>
                                <Image source={tickImagePath} style={styles.iconRight} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

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
        width: width,
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
        paddingVertical: height / 50,
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-end',
    },
    iconLeft: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    iconRight: {
        width: width / 28,
        height: width / 28,
    },
    titleTextRight: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

export default translate(['addAdditionalSeed', 'global'])(EditAccountName);
