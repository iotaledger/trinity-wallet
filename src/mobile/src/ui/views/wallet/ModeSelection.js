import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { setMode } from 'shared-modules/actions/settings';
import { setSetting } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import Fonts from 'ui/theme/fonts';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import InfoBox from 'ui/components/InfoBox';
import Toggle from 'ui/components/Toggle';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
        fontSize: Styling.fontSize3,
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
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    toggleText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize4,
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
        /** @ignore */
        mode: PropTypes.string.isRequired,
        /** @ignore */
        setMode: PropTypes.func.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.changeMode = this.changeMode.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('ModeSelection');
    }

    changeMode() {
        const { mode } = this.props;
        const nextMode = mode === 'Advanced' ? 'Standard' : 'Advanced';
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
                                    <Text style={[styles.infoText, textColor]}>{t('advancedModeExplanation')}</Text>
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
                                    active={mode === 'Advanced'}
                                    bodyColor={body.color}
                                    primaryColor={primary.color}
                                    scale={1.3}
                                />
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleText, textColor, { marginLeft: width / 45 }]}>
                                        {t('advanced')}
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
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:back')}</Text>
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

export default withNamespaces(['modeSelection', 'global'])(connect(mapStateToProps, mapDispatchToProps)(ModeSelection));
