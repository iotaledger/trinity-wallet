import cloneDeep from 'lodash/cloneDeep';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { updateTheme } from 'iota-wallet-shared-modules/actions/settings';
import THEMES from 'iota-wallet-shared-modules/themes/themes';
import Dropdown from '../containers/Dropdown'; // eslint-disable-line import/no-named-as-default
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import { Icon } from '../theme/icons.js';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        width,
    },
    themeSelectorContainer: {
        width: width / 1.3,
        height: height / 13,
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 2,
    },
    themeSelector: {
        justifyContent: 'flex-start',
        zIndex: 2,
    },
    demoContainer: {
        paddingTop: height / 44,
        paddingHorizontal: height / 26,
        paddingBottom: height / 26,
        borderRadius: GENERAL.borderRadius,
        borderWidth: 1.5,
        borderStyle: 'dotted',
        alignItems: 'center',
        marginTop: height / 30,
        position: 'absolute',
        top: height / 8.5,
        zIndex: 1,
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
        alignItems: 'center',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleTextLeft: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
    advancedButton: {
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        position: 'absolute',
        bottom: height / 80,
        zIndex: 3,
    },
    advancedText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize1,
        backgroundColor: 'transparent',
    },
    frameBar: {
        width: width / 1.5,
        height: height / 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.98,
        zIndex: 1,
    },
    frameBarTitle: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        color: '#ffffff',
        zIndex: 1,
    },
    chevronWrapper: {
        position: 'absolute',
        right: width / 30,
    },
    chevron: {
        height: width / 20,
        width: width / 20,
        position: 'absolute',
        right: width / 30,
    },
    buttonsContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginTop: height / 35,
        width: width / 1.5,
    },
    button: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3.4,
        height: height / 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    ctaButton: {
        borderRadius: GENERAL.borderRadius,
        width: width / 3.4,
        height: height / 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.2,
    },
    ctaText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
});

class ThemeCustomisation extends Component {
    static propTypes = {
        /** Update wallet's theme
         * @param {object} theme - New theme object
         * @param {string} themeName - New theme name
         */
        updateTheme: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Currently selected theme name */
        themeName: PropTypes.string.isRequired,
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            theme: props.theme,
            themeName: props.themeName,
            themes: Object.keys(THEMES),
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('ThemeCustomisation');
    }

    onApplyPress(theme, themeName) {
        const newTheme = cloneDeep(theme);
        this.props.updateTheme(newTheme, themeName);
    }

    render() {
        const { themes, theme, themeName } = this.state;
        const { body, bar, secondary, primary, positive, negative } = this.state.theme;
        const { t } = this.props;
        const bodyColor = this.props.theme.body.color;

        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if (this.dropdown) {
                        this.dropdown.closeDropdown();
                    }
                }}
            >
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ zIndex: 2 }}>
                            <Dropdown
                                onRef={(c) => {
                                    this.dropdown = c;
                                }}
                                title={t('theme')}
                                dropdownWidth={{ width: width / 1.45 }}
                                background
                                shadow
                                defaultOption={themeName}
                                options={themes}
                                saveSelection={(selection) => {
                                    const newTHEMES = cloneDeep(THEMES);
                                    let newTheme = newTHEMES[selection];
                                    if (selection === 'Custom' && this.props.themeName === 'Custom') {
                                        newTheme = this.props.theme;
                                    }
                                    this.setState({ themeName: selection, theme: newTheme });
                                }}
                            />
                        </View>
                        <View
                            style={[
                                styles.demoContainer,
                                {
                                    backgroundColor: body.bg,
                                    borderColor: body.color,
                                },
                            ]}
                        >
                            <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: height / 44 }}>
                                <Text
                                    style={{
                                        fontFamily: 'SourceSansPro-Regular',
                                        fontSize: GENERAL.fontSize2,
                                        color: body.color,
                                    }}
                                >
                                    MOCKUP
                                </Text>
                            </View>
                            <View style={[styles.frameBar, { backgroundColor: bar.bg }]}>
                                <Text style={[styles.frameBarTitle, { color: bar.color }]}>
                                    {t('global:mainWallet').toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.buttonsContainer}>
                                <View style={[styles.button, { borderColor: positive.color }]}>
                                    <Text style={[styles.buttonText, { color: positive.color }]}>
                                        {t('global:yes').toUpperCase()}
                                    </Text>
                                </View>
                                <View style={[styles.button, { borderColor: negative.color }]}>
                                    <Text style={[styles.buttonText, { color: negative.color }]}>
                                        {t('global:no').toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.buttonsContainer}>
                                <View style={[styles.button, { borderColor: secondary.color }]}>
                                    <Text style={[styles.buttonText, { color: secondary.color }]}>
                                        {t('global:back').toUpperCase()}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.ctaButton,
                                        { backgroundColor: primary.color, borderColor: primary.color },
                                    ]}
                                >
                                    <Text style={[styles.ctaText, { color: primary.body }]}>
                                        {t('global:send').toUpperCase()}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('mainSettings')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={bodyColor} />
                                <Text style={[styles.titleTextLeft, { color: bodyColor }]}>
                                    {t('global:backLowercase')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.onApplyPress(theme, themeName)}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, { color: bodyColor }]}>{t('global:apply')}</Text>
                                <Icon name="tick" size={width / 28} color={bodyColor} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    setSetting,
    updateTheme,
};

export default translate(['themeCustomisation', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(ThemeCustomisation),
);
