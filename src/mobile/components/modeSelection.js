import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import Fonts from '../theme/Fonts';
import { width, height } from '../util/dimensions';
import { Icon } from '../theme/icons.js';
import InfoBox from '../components/infoBox';
import Toggle from '../components/toggle';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
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
        alignItems: 'center',
    },
    infoText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 27.6,
        paddingTop: height / 60,
        backgroundColor: 'transparent',
        textAlign: 'justify',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    toggle: {
        marginHorizontal: width / 30,
    },
    toggleText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 23,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    toggleTextContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

class ModeSelection extends Component {
    static propTypes = {
        mode: PropTypes.string.isRequired,
        setMode: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        textColor: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.changeMode = this.changeMode.bind(this);
    }

    changeMode() {
        const { mode } = this.props;
        const nextMode = mode === 'Expert' ? 'Standard' : 'Expert';
        this.props.setMode(nextMode);
        this.props.generateAlert('success', 'Mode updated', `You have changed to ${nextMode} mode.`);
    }

    render() {
        const { t, mode, textColor, body, primary } = this.props;
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 2.3 }} />
                        <InfoBox
                            body={body}
                            text={
                                <View>
                                    <Text style={[styles.infoText, textColor]}>{t('expertModeExplanation')}</Text>
                                    <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                        {t('modesExplanation')}
                                    </Text>
                                </View>
                            }
                        />
                        <View style={{ flex: 0.8 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableWithoutFeedback onPress={this.changeMode}>
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleText, textColor, { paddingRight: width / 45 }]}>
                                        {t('standard')}
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={this.changeMode} style={{ alignSelf: 'center' }}>
                                <Toggle
                                    active={mode === 'Expert'}
                                    bodyColor={body.color}
                                    primaryColor={primary.color}
                                    scale={1.3}
                                />
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={this.changeMode}>
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleText, textColor, { paddingLeft: width / 45 }]}>
                                        {t('expert')}
                                    </Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={{ flex: 1.5 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.backPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={body.color} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['modeSelection', 'global'])(ModeSelection);
