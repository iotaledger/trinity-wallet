import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { setSetting } from 'shared-modules/actions/wallet';
import { setLanguage, setLocale } from 'shared-modules/actions/settings';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { I18N_LOCALE_LABELS, getLocaleFromLabel } from 'shared-modules/libs/i18n';
import i18next from 'shared-modules/libs/i18next';
import DropdownComponent from 'ui/components/Dropdown';
import SettingsDualFooter from 'ui/components/SettingsDualFooter';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { width } from 'libs/dimensions';

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
        justifyContent: 'center',
    },
});

/** Language Selection component */
class LanguageSelection extends Component {
    static propTypes = {
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setLanguage: PropTypes.func.isRequired,
        /** @ignore */
        setLocale: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        language: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            languageSelected: props.language,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('LanguageSelection');
    }

    /**
     * Saves user-selected language
     */
    saveLanguageSelection() {
        const nextLanguage = this.state.languageSelected;

        this.props.setLanguage(nextLanguage);
        this.props.setLocale(getLocaleFromLabel(nextLanguage));

        i18next.changeLanguage(getLocaleFromLabel(nextLanguage));

        this.props.setSetting('mainSettings');
    }

    render() {
        const { t, theme, language } = this.props;

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
                        <DropdownComponent
                            onRef={(c) => {
                                this.dropdown = c;
                            }}
                            title={t('language')}
                            dropdownWidth={{ width: width / 1.5 }}
                            value={this.state.languageSelected}
                            options={I18N_LOCALE_LABELS}
                            saveSelection={(languageSelected) => this.setState({ languageSelected })}
                        />
                        <View style={{ flex: 0.15 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <SettingsDualFooter
                            hideActionButton={this.state.languageSelected === language }
                            theme={theme}
                            backFunction={() => this.props.setSetting('mainSettings')}
                            actionFunction={() => this.saveLanguageSelection()}
                            actionName={t('global:save')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    language: state.settings.language,
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    setLocale,
    setLanguage,
    setSetting,
};

export default withNamespaces(['languageSetup', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(LanguageSelection),
);
