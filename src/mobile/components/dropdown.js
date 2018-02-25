import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, ListView, LayoutAnimation, TouchableWithoutFeedback } from 'react-native';
import Triangle from 'react-native-triangle';
import { connect } from 'react-redux';
import { isAndroid } from '../util/device';
import { width, height } from '../util/dimensions';

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
        fontFamily: 'Lato-Regular',
        fontSize: width / 33,
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
        fontSize: width / 23,
        fontFamily: 'Lato-Light',
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
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
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

export class Dropdown extends Component {
    static propTypes = {
        onRef: PropTypes.func,
        disableWhen: PropTypes.bool,
        shadow: PropTypes.bool,
        defaultOption: PropTypes.string,
        saveSelection: PropTypes.func,
        options: PropTypes.array.isRequired,
        title: PropTypes.string,
        dropdownWidth: PropTypes.object,
        background: PropTypes.bool,
        negativeColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string,
        backgroundColor: PropTypes.string.isRequired,
    };

    static defaultProps = {
        shadow: false,
        disableWhen: false,
        onRef: () => {},
        defaultOption: '',
        background: false,
        saveSelection: () => {},
        title: '',
        dropdownWidth: { width: width / 1.2 },
        secondaryBackgroundColor: 'white',
    };

    constructor(props) {
        super(props);

        this.state = {
            isDropdownOpen: false,
            selectedOption: this.props.defaultOption,
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

    onOptionPress(option) {
        this.setState({
            isDropdownOpen: false,
            selectedOption: option,
        });

        const { saveSelection } = this.props;
        if (!saveSelection) return;
        saveSelection(option);
    }

    onDropdownTitlePress() {
        LayoutAnimation.configureNext(CustomLayoutSpring);

        const { isDropdownOpen } = this.state;

        this.setState({
            isDropdownOpen: !isDropdownOpen,
        });
    }

    getSelected() {
        return this.state.selectedOption;
    }

    closeDropdown() {
        this.setState({ isDropdownOpen: false });
    }

    render() {
        const {
            options,
            title,
            dropdownWidth,
            background,
            negativeColor,
            disableWhen,
            secondaryBackgroundColor,
            shadow,
        } = this.props;
        const { isDropdownOpen, selectedOption } = this.state;
        const triangleDirection = isDropdownOpen ? 'up' : 'down';
        const heightValue = options.length < 7 ? height / 22.4 * options.length + height / 70 : height / 3.2;
        const dropdownHeight = isDropdownOpen ? heightValue : 0;
        const backgroundColor = background
            ? { backgroundColor: this.props.backgroundColor }
            : { backgroundColor: 'transparent' };
        const shadowColor = shadow ? { shadowColor: '#222' } : { shadowColor: 'transparent' };
        const lastItem = options.length - 1;

        return (
            <View style={[styles.container, dropdownWidth]}>
                <Text style={[styles.dropdownTitle, { color: negativeColor }, isAndroid ? null : dropdownWidth]}>
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
                        <View
                            style={[
                                styles.dropdownButton,
                                dropdownWidth,
                                { borderBottomColor: secondaryBackgroundColor },
                            ]}
                        >
                            <Text numberOfLines={1} style={[styles.selected, { color: secondaryBackgroundColor }]}>
                                {selectedOption}
                            </Text>
                            <Triangle
                                width={width / 40}
                                height={width / 40}
                                color={secondaryBackgroundColor}
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
                        <View style={[styles.dropdownInnerContainer, shadowColor]}>
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
                                                                { color: secondaryBackgroundColor },
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
                                                        { color: secondaryBackgroundColor },
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
    barColor: state.settings.theme.barColor,
    backgroundColor: state.settings.theme.backgroundColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

export default connect(mapStateToProps)(Dropdown);
