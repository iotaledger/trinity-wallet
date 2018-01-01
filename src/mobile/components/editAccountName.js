import trim from 'lodash/trim';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, View, Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import { width, height } from '../util/dimensions';
import arrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left.png';
import tickImagePath from 'iota-wallet-shared-modules/images/tick.png';
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
        const { t } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={styles.textFieldContainer}>
                            <TextField
                                style={{ color: 'white', fontFamily: 'Lato-Light' }}
                                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                labelFontSize={width / 31.8}
                                fontSize={width / 20.7}
                                labelPadding={3}
                                baseColor="white"
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
                                <Image source={arrowLeftImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.saveAccountName(trim(this.state.accountName))}>
                            <View style={styles.itemRight}>
                                <Image source={tickImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>{t('global:save')}</Text>
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
    saveButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    saveText: {
        color: 'white',
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
    icon: {
        width: width / 22,
        height: width / 22,
        marginRight: width / 25,
    },
    titleText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
});

export default translate(['addAdditionalSeed', 'global'])(EditAccountName);
