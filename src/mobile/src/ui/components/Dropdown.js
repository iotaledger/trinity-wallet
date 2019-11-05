import every from 'lodash/every';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import map from 'lodash/map';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { withTranslation } from 'react-i18next';
import Triangle from 'react-native-triangle';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { isIPhoneX, isAndroid } from 'libs/device';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import RNPickerSelect from 'react-native-picker-select';

const styles = StyleSheet.create({
    dropdownTitle: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize2,
        backgroundColor: 'transparent',
        paddingLeft: width / 100,
        position: 'absolute',
        top: -height / 35,
    },
    selected: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        paddingBottom: height / 150,
        paddingLeft: width / 100,
        flex: 1,
    },
    pickerItem: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderBottomWidth: 0.7,
        height: height / 22,
    },
    triangle: {
        marginBottom: height / 80,
        marginRight: width / 100,
    },
});

/** Dropdown component */
export class Dropdown extends Component {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Callback function returning dropdown component instance as an argument */
        /** @param {object} instance - dropdown instance
         */
        onRef: PropTypes.func,
        /** Determines whether onPress event should be disabled for dropdown */
        disableWhen: PropTypes.bool,
        /** Default selected option for dropdown */
        value: PropTypes.string,
        /** Saves dropdown selection
         * @param {string} option
         */
        saveSelection: PropTypes.func,
        /** Dropdown options list */
        options: PropTypes.array.isRequired,
        /** Dropdown title */
        title: PropTypes.string,
        /** Dropdown width */
        dropdownWidth: PropTypes.object,
        /** Custom dropdown button */
        customView: PropTypes.object,
        /** Dropdown title style */
        dropdownTitleStyle: PropTypes.object,
        /** Dropdown selected option style */
        dropdownSelectedOptionStyle: PropTypes.object,
    };

    static defaultProps = {
        shadow: false,
        disableWhen: false,
        onRef: () => {},
        value: '',
        saveSelection: () => {},
        title: '',
        dropdownWidth: { width: isIPhoneX ? width / 1.3 : width / 1.5 },
        customView: undefined,
    };

    constructor(props) {
        super(props);
        this.state = {
            isDropdownOpen: false,
            selectedOption: { label: this.props.value, value: this.props.value },
        };
    }

    componentDidMount() {
        if (this.props.onRef) {
            this.props.onRef(this);
        }
    }

    componentWillUnmount() {
        if (this.props.onRef) {
            this.props.onRef(null);
        }
    }

    /**
     * Returns currently selected dropdown item
     *
     * @method getSelectedItem
     */
    getSelectedItem() {
        return this.state.selectedOption.value;
    }

    /**
     * Trigger to close dropdown
     *
     * @method closeDropdown
     */
    closeDropdown() {
        if (this.dropdown.state.showPicker) {
            this.dropdown.togglePicker();
        }
    }

    /**
     * Trigger to open dropdown
     *
     * @method openDropdown
     */
    openDropdown() {
        if (!this.dropdown.state.showPicker) {
            this.dropdown.togglePicker();
        }
    }

    /**
     * Formats dropdown options for use with RNPickerSelect
     *
     * @method formatOptions
     */
    formatOptions(options) {
        return !isEmpty(options) && every(options, isString)
            ? map(options, (option) => ({ label: option, value: option }))
            : options;
    }

    render() {
        const {
            t,
            options,
            title,
            dropdownWidth,
            disableWhen,
            theme,
            customView,
            dropdownTitleStyle,
            dropdownSelectedOptionStyle,
        } = this.props;
        const { isDropdownOpen, selectedOption } = this.state;
        const triangleDirection = isDropdownOpen ? 'up' : 'down';
        const formattedOptions = this.formatOptions(options);

        return (
            <View style={[!customView && { paddingTop: height / 35 }, dropdownWidth]}>
                <RNPickerSelect
                    ref={(ref) => {
                        this.dropdown = ref;
                    }}
                    onOpen={() => this.setState({ isDropdownOpen: true })}
                    onClose={() => this.setState({ isDropdownOpen: false })}
                    placeholder={{}}
                    items={formattedOptions}
                    onValueChange={(value) => {
                        this.setState({ selectedOption: { value, label: value } });
                        this.props.saveSelection(value);
                    }}
                    doneText={t('done')}
                    disabled={disableWhen}
                    value={selectedOption.value}
                    useNativeAndroidPickerStyle={false}
                    Icon={() => {}}
                    pickerProps={{ itemStyle: [styles.pickerItem] }}
                >
                    {(customView && customView) || (
                        <View>
                            <Text
                                style={[
                                    styles.dropdownTitle,
                                    { color: theme.primary.color },
                                    isAndroid ? null : dropdownWidth,
                                    dropdownTitleStyle,
                                ]}
                            >
                                {title}
                            </Text>
                            <View
                                style={[styles.dropdownButton, dropdownWidth, { borderBottomColor: theme.body.color }]}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={[styles.selected, { color: theme.body.color }, dropdownSelectedOptionStyle]}
                                >
                                    {selectedOption.label}
                                </Text>
                                <Triangle
                                    width={width / 40}
                                    height={width / 40}
                                    color={theme.body.color}
                                    direction={triangleDirection}
                                    style={styles.triangle}
                                />
                            </View>
                        </View>
                    )}
                </RNPickerSelect>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

export default withTranslation(['global'])(connect(mapStateToProps)(Dropdown));
