import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import { changePowSettings } from 'shared/actions/settings';
import { setSetting } from 'shared/actions/wallet';
import Fonts from 'mobile/src/ui/theme/fonts';
import { width, height } from 'mobile/src/libs/dimensions';
import { Icon } from 'mobile/src/ui/theme/icons';
import InfoBox from 'mobile/src/ui/components/InfoBox';
import Toggle from 'mobile/src/ui/components/Toggle';
import GENERAL from 'mobile/src/ui/theme/general';
import { leaveNavigationBreadcrumb } from 'mobile/src/libs/bugsnag';

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

/** Proof Of Work settings component */
class Pow extends Component {
    static propTypes = {
        /** @ignore */
        remotePoW: PropTypes.bool.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        changePowSettings: PropTypes.func.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('Pow');
    }

    onChange() {
        this.props.changePowSettings();
    }

    render() {
        const { t, remotePoW, theme: { body, primary } } = this.props;
        const textColor = { color: body.color };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 2 }} />
                        <InfoBox
                            body={body}
                            text={
                                <View>
                                    <Text style={[styles.infoText, textColor]}>{t('feeless')}</Text>
                                    <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                        {t('localOrRemote')}
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
                                        {t('local')}
                                    </Text>
                                </View>
                                <Toggle
                                    active={remotePoW}
                                    bodyColor={body.color}
                                    primaryColor={primary.color}
                                    scale={1.3}
                                />
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleText, textColor, { marginLeft: width / 45 }]}>
                                        {t('remote')}
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
    remotePoW: state.settings.remotePoW,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    changePowSettings,
    setSetting,
};

export default translate(['pow', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Pow));
