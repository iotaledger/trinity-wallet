import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { setSetting } from 'shared-modules/actions/wallet';
import { setLanguage, setLocale } from 'shared-modules/actions/settings';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { I18N_LOCALE_LABELS, getLocaleFromLabel } from 'shared-modules/libs/i18n';
import i18next from 'shared-modules/libs/i18next';
import DropdownComponent from 'ui/components/Dropdown';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const { width } = Dimensions.get('window');
const { height } = global;

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
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
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
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;

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
                        <View style={{ flex: 0.4 }} />
                        <DropdownComponent
                            onRef={(c) => {
                                this.dropdown = c;
                            }}
                            title={t('language')}
                            dropdownWidth={{ width: width / 1.5 }}
                            value={this.state.languageSelected}
                            options={I18N_LOCALE_LABELS}
                            saveSelection={(lang) => {
                                this.setState({ languageSelected: lang });
                            }}
                            background
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('mainSettings')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={bodyColor} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.saveLanguageSelection()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:save')}</Text>
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
