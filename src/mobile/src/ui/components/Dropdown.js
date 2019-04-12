import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, ListView, LayoutAnimation, TouchableWithoutFeedback } from 'react-native';
import Triangle from 'react-native-triangle';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { isIPhoneX, isAndroid } from 'libs/device';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const CustomLayoutSpring = {
    duration: 100,
    create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleXY,
        springDamping: 0.7,
    },
    update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    dropdownContainer: {
        justifyContent: 'flex-start',
        paddingLeft: 2,
        paddingRight: 2,
        paddingBottom: 2,
    },
    dropdownTitle: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize2,
        backgroundColor: 'transparent',
        paddingLeft: width / 100,
    },
    dropdownItemContainer: {
        flex: 1,
        height: height / 22.4,
        alignItems: 'stretch',
        justifyContent: 'center',
        paddingLeft: width / 100,
    },
    listView: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    dropdownItem: {
        fontSize: Styling.fontSize4,
        fontFamily: 'SourceSansPro-Light',
        backgroundColor: 'transparent',
        textAlign: 'left',
        paddingTop: height / 100,
        width: width / 3,
    },
    dropdownButtonContainer: {
        marginTop: height / 150,
    },
    dropdownInnerContainer: {
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 4,
        shadowOpacity: 0.6,
    },
    selected: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        paddingBottom: height / 150,
        paddingLeft: width / 100,
        flex: 1,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderBottomWidth: 0.7,
        width: width / 3,
        height: height / 22,
    },
    additionalPadding: {
        height: height / 78,
    },
    triangle: {
        marginBottom: height / 80,
        marginRight: width / 100,
    },
});

/** Dropdown component */
export class Dropdown extends Component {
    static propTypes = {
        /** Callback function returning dropdown component instance as an argument */
        /** @param {object} instance - dropdown instance
         */
        onRef: PropTypes.func,
        /** Determines whether onPress event should be disabled for dropdown */
        disableWhen: PropTypes.bool,
        /** Determines whether to render a shadow */
        shadow: PropTypes.bool,
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
        /** Determines whether to render a background */
        background: PropTypes.bool,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Determines how many rows should be visible */
        visibleRows: PropTypes.number,
    };

    static defaultProps = {
        shadow: false,
        disableWhen: false,
        onRef: () => {},
        value: '',
        background: false,
        saveSelection: () => {},
        title: '',
        dropdownWidth: { width: isIPhoneX ? width / 1.3 : width / 1.5 },
        visibleRows: 8,
    };

    constructor(props) {
        super(props);

        this.state = {
            isDropdownOpen: false,
            selectedOption: this.props.value,
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
     * Selects dropdown option in internal state
     *
     * @method onOptionPress
     * @param {string} option
     */
    onOptionPress(option) {
        this.setState({
            isDropdownOpen: false,
            selectedOption: option,
        });

        const { saveSelection } = this.props;

        if (!saveSelection) {
            return;
        }

        saveSelection(option);
    }

    /**
     * Show/hide dropdown options
     *
     * @method onDropdownTitlePress
     */
    onDropdownTitlePress() {
        LayoutAnimation.configureNext(CustomLayoutSpring);

        const { isDropdownOpen } = this.state;

        this.setState({
            isDropdownOpen: !isDropdownOpen,
        });
    }

    /**
     * Gets selected dropdown option
     *
     * @method getSelected
     */
    getSelected() {
        return this.state.selectedOption;
    }

    /**
     * Hides dropdown options
     *
     * @method closeDropdown
     */
    closeDropdown() {
        this.setState({ isDropdownOpen: false });
    }

    render() {
        const { options, title, dropdownWidth, background, disableWhen, theme, shadow, visibleRows } = this.props;
        const { isDropdownOpen, selectedOption } = this.state;
        const triangleDirection = isDropdownOpen ? 'up' : 'down';
        const heightValue = height / 22.4 * visibleRows + height / 70;
        const dropdownHeight = isDropdownOpen ? heightValue : 0;
        const backgroundColor = background ? { backgroundColor: theme.body.bg } : { backgroundColor: 'transparent' };
        const shadowColor = shadow ? { shadowColor: '#222' } : { shadowColor: 'transparent' };
        const lastItem = options.length - 1;

        return (
            <View style={[styles.container, dropdownWidth]}>
                <Text style={[styles.dropdownTitle, { color: theme.primary.color }, isAndroid ? null : dropdownWidth]}>
                    {title}
                </Text>
                <View style={styles.dropdownButtonContainer}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            if (!disableWhen) {
                                this.onDropdownTitlePress();
                            }
                        }}
                    >
                        <View style={[styles.dropdownButton, dropdownWidth, { borderBottomColor: theme.body.color }]}>
                            <Text numberOfLines={1} style={[styles.selected, { color: theme.body.color }]}>
                                {selectedOption}
                            </Text>
                            <Triangle
                                width={width / 40}
                                height={width / 40}
                                color={theme.body.color}
                                direction={triangleDirection}
                                style={styles.triangle}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <View
                    style={{
                        height: dropdownHeight,
                        overflow: 'hidden',
                        backgroundColor: 'transparent',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                    }}
                >
                    <View style={[styles.dropdownContainer, dropdownWidth]}>
                        <View style={[styles.dropdownInnerContainer, shadowColor, backgroundColor]}>
                            <ListView
                                dataSource={ds.cloneWithRows(options)}
                                renderRow={(rowData, sectionId, rowId) => {
                                    if (rowId.toString() === lastItem.toString()) {
                                        return (
                                            <View>
                                                <TouchableWithoutFeedback
                                                    onPress={() => this.onOptionPress(rowData)}
                                                    style={{ alignItems: 'flex-start', flex: 1 }}
                                                >
                                                    <View
                                                        style={[
                                                            styles.dropdownItemContainer,
                                                            backgroundColor,
                                                            dropdownWidth,
                                                        ]}
                                                    >
                                                        <Text
                                                            numberOfLines={1}
                                                            style={[
                                                                styles.dropdownItem,
                                                                dropdownWidth,
                                                                { color: theme.body.color },
                                                            ]}
                                                        >
                                                            {rowData}
                                                        </Text>
                                                    </View>
                                                </TouchableWithoutFeedback>
                                                <View style={[styles.additionalPadding, backgroundColor]} />
                                            </View>
                                        );
                                    }
                                    return (
                                        <TouchableWithoutFeedback
                                            onPress={() => this.onOptionPress(rowData)}
                                            style={{ alignItems: 'flex-start', flex: 1 }}
                                        >
                                            <View
                                                style={[styles.dropdownItemContainer, backgroundColor, dropdownWidth]}
                                            >
                                                <Text
                                                    numberOfLines={1}
                                                    style={[
                                                        styles.dropdownItem,
                                                        dropdownWidth,
                                                        { color: theme.body.color },
                                                    ]}
                                                >
                                                    {rowData}
                                                </Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    );
                                }}
                                contentContainerView={styles.listView}
                                enableEmptySections
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

export default connect(mapStateToProps)(Dropdown);
