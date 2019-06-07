import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { changeDeepLinkingSettings } from 'shared-modules/actions/settings';
import { setSetting, completeDeepLinkRequest } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import Fonts from 'ui/theme/fonts';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import SettingsBackButton from 'ui/components/SettingsBackButton';
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
    },
    topContainer: {
        flex: 11,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    toggleText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    toggleTextContainer: {
        justifyContent: 'center',
    },
    icon: {
        backgroundColor: 'transparent',
    },
});

/** DeepLinking settings component */
class DeepLinking extends Component {
    static propTypes = {
        /** @ignore */
        deepLinking: PropTypes.bool.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        changeDeepLinkingSettings: PropTypes.func.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        deepLinkRequestActive: PropTypes.bool.isRequired,
        /** @ignore */
        completeDeepLinkRequest: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('DeepLinking');
    }

    componentWillReceiveProps(newProps) {
        // If a deep link was in progress but deep linking was not enabled at the time, clear previous deep link request
        if (this.props.deepLinkRequestActive && !this.props.deepLinking && newProps.deepLinking) {
            this.props.completeDeepLinkRequest();
        }
    }

    onChange() {
        this.props.changeDeepLinkingSettings();
    }

    render() {
        const { t, deepLinking, theme } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 2 }} />
                        <InfoBox>
                            <View
                                style={{
                                    width: Styling.contentWidth,
                                    alignItems: 'center',
                                    paddingBottom: height / 22,
                                }}
                            >
                                <Icon name="attention" size={width / 10} color={theme.body.color} style={styles.icon} />
                            </View>
                            <Text style={[styles.infoText, textColor]}>{t('deepLinkingOverview')}</Text>
                            <Text style={{ paddingTop: height / 30 }}>
                                <Text style={[styles.infoTextBold, textColor]}>
                                    {`${t('rootDetection:warning')}: `}
                                </Text>
                                <Text style={[styles.infoTextLight, textColor]}>{t('deepLinkingWarning')}</Text>
                            </Text>
                        </InfoBox>
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
                                    active={deepLinking}
                                    bodyColor={theme.body.color}
                                    primaryColor={theme.primary.color}
                                    scale={1.31}
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
                        <SettingsBackButton
                            theme={theme}
                            backFunction={() => this.props.setSetting('advancedSettings')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    deepLinking: state.settings.deepLinking,
    deepLinkRequestActive: state.wallet.deepLinkRequestActive,
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    changeDeepLinkingSettings,
    setSetting,
    completeDeepLinkRequest,
};

export default withNamespaces(['deepLink', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(DeepLinking),
);
