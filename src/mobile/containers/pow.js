import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { updatePowSettings } from 'iota-wallet-shared-modules/actions/settings';
import Fonts from '../theme/Fonts';
import { width, height } from '../util/dimensions';
import { isAndroid } from '../util/device';
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
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
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
    },
});

class Pow extends Component {
    static propTypes = {
        backPress: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        remotePoW: PropTypes.bool.isRequired,
        t: PropTypes.func.isRequired,
        updatePowSettings: PropTypes.func.isRequired,
        body: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.onChange = this.onChange.bind(this);
    }

    onChange() {
        const { t } = this.props;
        // Temporarily disable enabling PoW for android
        // Version 3.4.0
        if (isAndroid) {
            this.props.generateAlert('error', 'Not available', 'On device proof of work is not available for android.');
        } else {
            this.props.updatePowSettings();
            this.props.generateAlert('success', t('powUpdated'), t('powUpdatedExplanation'));
        }
    }

    render() {
        const { t, remotePoW, body, primary } = this.props;
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
                                    <Text style={[styles.infoText, textColor]}>{t('feeless')}</Text>
                                    <Text style={[styles.infoText, textColor, infoTextPadding]}>
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
                                    <Text style={[styles.toggleText, textColor, { paddingRight: width / 45 }]}>
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
                                    <Text style={[styles.toggleText, textColor, { paddingLeft: width / 45 }]}>
                                        {t('remote')}
                                    </Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
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

const mapStateToProps = (state) => ({
    remotePoW: state.settings.remotePoW,
    body: state.settings.theme.body,
    primary: state.settings.theme.primary,
});

const mapDispatchToProps = {
    generateAlert,
    updatePowSettings,
};

export default translate(['pow', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Pow));
