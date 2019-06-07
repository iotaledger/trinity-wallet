import cloneDeep from 'lodash/cloneDeep';
import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { setSetting } from 'shared-modules/actions/wallet';
import { updateTheme } from 'shared-modules/actions/settings';
import { getThemeFromState } from 'shared-modules/selectors/global';
import THEMES from 'shared-modules/themes/themes';
import DropdownComponent from 'ui/components/Dropdown';
import SettingsDualFooter from 'ui/components/SettingsDualFooter';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        width,
    },
    demoContainer: {
        paddingTop: height / 44,
        paddingHorizontal: height / 26,
        paddingBottom: height / 26,
        borderRadius: Styling.borderRadius,
        borderWidth: 1.5,
        borderStyle: 'dotted',
        alignItems: 'center',
        marginTop: height / 30,
        zIndex: 1,
    },
    bottomContainer: {
        flex: 1,
    },
    topContainer: {
        flex: 11,
        alignItems: 'center',
        justifyContent: 'center',
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
        fontSize: Styling.fontSize3,
        color: '#ffffff',
        zIndex: 1,
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
        borderRadius: Styling.borderRadius,
        width: width / 3.4,
        height: height / 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    ctaButton: {
        borderRadius: Styling.borderRadius,
        width: width / 3.4,
        height: height / 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.2,
    },
    ctaText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
});

class ThemeCustomisation extends Component {
    static propTypes = {
        /** @ignore */
        updateTheme: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            theme: props.theme,
            themeName: props.themeName,
            themes: Object.keys(THEMES).map((theme, index) => ({ theme, index })),
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('ThemeCustomisation');
    }

    /**
     * Update wallet's theme
     *
     * @method onApplyPress
     * @param {string} themeName
     */
    onApplyPress(themeName) {
        this.props.updateTheme(themeName);
    }

    getLocalizedThemeName(themeName) {
        const { t } = this.props;
        return t(`themes:${themeName.toLowerCase()}`);
    }

    getLocalizedThemes() {
        const localizedThemes = this.state.themes.map((item) => {
            return {
                ...item,
                theme: this.getLocalizedThemeName(item.theme),
            };
        });

        return localizedThemes;
    }

    getThemeName(localizedThemeName) {
        const localizedThemes = this.getLocalizedThemes();
        const { index } = localizedThemes.find(({ theme }) => theme === localizedThemeName);

        return this.state.themes.find((value) => value.index === index).theme;
    }

    render() {
        const { themeName } = this.state;
        const { body, bar, secondary, primary, positive, negative } = this.state.theme;
        const { t, theme } = this.props;

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
                            <DropdownComponent
                                onRef={(c) => {
                                    this.dropdown = c;
                                }}
                                title={t('theme')}
                                dropdownWidth={{ width: width / 1.45 }}
                                value={this.getLocalizedThemeName(themeName)}
                                options={this.getLocalizedThemes().map(({ theme }) => theme)}
                                saveSelection={(localizedSelection) => {
                                    const selection = this.getThemeName(localizedSelection);
                                    const newTHEMES = cloneDeep(THEMES);
                                    let newTheme = newTHEMES[selection];
                                    if (selection === 'Custom' && this.props.themeName === 'Custom') {
                                        newTheme = this.props.theme;
                                    }
                                    this.setState({ themeName: selection, theme: newTheme });
                                }}
                                visibleRows={Object.keys(THEMES).length}
                            />
                        </View>
                        <View style={{ flex: 0.2 }} />
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
                                        fontSize: Styling.fontSize2,
                                        color: body.color,
                                    }}
                                >
                                    {t('themeCustomisation:mockup').toUpperCase()}
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
                        <SettingsDualFooter
                            theme={theme}
                            backFunction={() => this.props.setSetting('mainSettings')}
                            actionFunction={() => this.onApplyPress(themeName)}
                            actionName={t('global:apply')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    setSetting,
    updateTheme,
};

export default withNamespaces(['themeCustomisation', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(ThemeCustomisation),
);
