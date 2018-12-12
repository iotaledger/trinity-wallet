import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Keyboard } from 'react-native';
import { changeAutoPromotionSettings } from 'shared-modules/actions/settings';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
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
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 70,
        justifyContent: 'flex-start',
    },
    titleTextLeft: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    toggle: {
        marginHorizontal: width / 30,
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
});

/** Auto-promotion settings component */
class AutoPromotion extends Component {
    static propTypes = {
        /** @ignore */
        autoPromotion: PropTypes.bool.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        changeAutoPromotionSettings: PropTypes.func.isRequired,
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
        leaveNavigationBreadcrumb('AutoPromotion');
    }

    /**
     * Updates auto promotion configuration
     *
     * @method onChange
     */
    onChange() {
        this.props.changeAutoPromotionSettings();
    }

    render() {
        const { t, autoPromotion, theme: { body, primary } } = this.props;
        const textColor = { color: body.color };
        const infoTextPadding = { paddingTop: height / 50 };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 2 }} />
                        <InfoBox>
                            <Text style={[styles.infoText, textColor]}>{t('autoPromotionExplanation')}</Text>
                            <Text style={[styles.infoText, textColor, infoTextPadding]}>{t('autoPromotionPoW')}</Text>
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
                                    active={autoPromotion}
                                    bodyColor={body.color}
                                    primaryColor={primary.color}
                                    scale={1.3}
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
    autoPromotion: state.settings.autoPromotion,
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    changeAutoPromotionSettings,
    setSetting,
};

export default withNamespaces(['advancedSettings', 'autoPromotion', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(AutoPromotion),
);
