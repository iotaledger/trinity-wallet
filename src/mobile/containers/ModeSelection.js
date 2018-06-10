import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { setMode } from 'iota-wallet-shared-modules/actions/settings';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import Fonts from '../theme/fonts';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import InfoBox from '../components/InfoBox';
import Toggle from '../components/Toggle';
import GENERAL from '../theme/general';

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
        flex: 11,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    infoText: {
        fontFamily: Fonts.secondary,
        fontSize: GENERAL.fontSize3,
        paddingTop: height / 60,
        backgroundColor: 'transparent',
        textAlign: 'left',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    titleTextLeft: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    toggle: {
        marginHorizontal: width / 30,
    },
    toggleText: {
        fontFamily: Fonts.secondary,
        fontSize: GENERAL.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    toggleTextContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

/** Mode Selection component */
class ModeSelection extends Component {
    static propTypes = {
        /** Currently selected wallet mode (Expert or Standard) */
        mode: PropTypes.string.isRequired,
        /** Change current mode
         * @param {string} mode
         */
        setMode: PropTypes.func.isRequired,
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
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
        const { t, mode, theme: { body, primary } } = this.props;

        const textColor = { color: body.color };
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
                        <TouchableWithoutFeedback
                            onPress={this.changeMode}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 70, right: width / 35 }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleText, textColor, { marginRight: width / 45 }]}>
                                        {t('standard')}
                                    </Text>
                                </View>
                                <Toggle
                                    active={mode === 'Expert'}
                                    bodyColor={body.color}
                                    primaryColor={primary.color}
                                    scale={1.3}
                                />
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleText, textColor, { marginLeft: width / 45 }]}>
                                        {t('expert')}
                                    </Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                        <View style={{ flex: 1.5 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('mainSettings')}
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

const mapStateToProps = (state) => ({
    mode: state.settings.mode,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setMode,
    setSetting,
    generateAlert,
};

export default translate(['modeSelection', 'global'])(connect(mapStateToProps, mapDispatchToProps)(ModeSelection));
