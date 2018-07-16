import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import Fonts from '../theme/fonts';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons';
import InfoBox from '../components/InfoBox';
import Toggle from '../components/Toggle';
import GENERAL from '../theme/general';
import { backgroundFetchStatus } from '../utils/device';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

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
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
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
    },
});

/** Background processes settings component */
class BackgroundProcesses extends Component {
    static propTypes = {
        /** Determines whether background processes is enabled */
        backgroundProcesses: PropTypes.bool.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.state = {
            status: 0,
        };

        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('BackgroundProcesses');
        // Get system background fetch status
        backgroundFetchStatus().then((status) => {
            this.setState({ status });
        });
    }

    onChange() {
        //  this.props.changeBackgroundProcessesSettings();
    }

    render() {
        const { status } = this.state;
        const { t, backgroundProcesses, theme: { body, primary } } = this.props;
        const textColor = { color: body.color };
        const infoTextPadding = { paddingTop: height / 50 };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 2 }} />
                        <InfoBox
                            body={body}
                            text={
                                <View>
                                    <Text style={[styles.infoText, textColor]}>{t('autoPromotionExplanation')}</Text>
                                    <Text style={[styles.infoText, textColor, infoTextPadding]}>
                                        {t('autoPromotionPoW')}
                                    </Text>
                                </View>
                            }
                        />
                        <View style={{ flex: 1.1 }} />
                        <TouchableWithoutFeedback
                            onPress={this.onChange}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 70, right: width / 35 }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleText, textColor, { marginRight: width / 45 }]}>
                                        {t('disabled')}
                                    </Text>
                                </View>
                                <Toggle
                                    /* Set toggle to "disabled" if background fetch is disabled by the system */
                                    active={status < 2 ? false : backgroundProcesses}
                                    bodyColor={body.color}
                                    primaryColor={primary.color}
                                    scale={1.3}
                                    /* Reduce toggle opacity if background fetch is disabled by the system */
                                    opacity={status < 2 ? 0.1 : 1}
                                />
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleText, textColor, { marginLeft: width / 45 }]}>
                                        {t('enabled')}
                                    </Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                        <View style={{ flex: 1.5 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('advancedSettings')}
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
    backgroundProcesses: state.settings.backgroundProcesses,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setSetting,
};

export default translate(['advancedSettings', 'backgroundProcesses', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(BackgroundProcesses),
);
