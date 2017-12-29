import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ListView,
    LayoutAnimation,
    TouchableWithoutFeedback,
} from 'react-native';
import Triangle from 'react-native-triangle';
import THEMES from '../theme/themes';
import { connect } from 'react-redux';

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
        color: 'white',
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
            width: -1,
            height: -2,
        },
        shadowRadius: 4,
        shadowOpacity: 1.0,
    },
    selected: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingBottom: height / 150,
        paddingLeft: width / 100,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderBottomColor: 'white',
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

class Dropdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDropdownOpen: false,
            selectedOption: this.props.defaultOption,
        };
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
        const { options, title, dropdownWidth, background, shadow, negativeColor, barColor } = this.props;
        const { isDropdownOpen, selectedOption } = this.state;
        const triangleDirection = isDropdownOpen ? 'up' : 'down';
        const heightValue = options.length < 7 ? height / 22.4 * options.length + height / 70 : height / 3.2;
        const dropdownHeight = isDropdownOpen ? heightValue : 0;
        const shadowColor = shadow ? { shadowColor: THEMES.getHSL(barColor) } : { shadowColor: 'transparent' };
        const backgroundColor = background
            ? { backgroundColor: THEMES.getHSL(this.props.backgroundColor) }
            : { backgroundColor: 'transparent' };
        const lastItem = options.length - 1;

        return (
            <View style={[styles.container, dropdownWidth]}>
                <Text style={[styles.dropdownTitle, { color: THEMES.getHSL(negativeColor) }, dropdownWidth]}>
                    {title}
                </Text>
                <View style={styles.dropdownButtonContainer}>
                    <TouchableWithoutFeedback onPress={() => this.onDropdownTitlePress()}>
                        <View style={[styles.dropdownButton, dropdownWidth]}>
                            <Text numberOfLines={1} style={[styles.selected, dropdownWidth]}>
                                {selectedOption}
                            </Text>
                            <Triangle
                                width={10}
                                height={10}
                                color={'white'}
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
                                                <TouchableOpacity
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
                                                            style={[styles.dropdownItem, dropdownWidth]}
                                                        >
                                                            {rowData}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                                <View style={[styles.additionalPadding, backgroundColor]} />
                                            </View>
                                        );
                                    } else {
                                        return (
                                            <TouchableOpacity
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
                                                        style={[styles.dropdownItem, dropdownWidth]}
                                                    >
                                                        {rowData}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }
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

const mapStateToProps = state => ({
    barColor: state.settings.theme.barColor,
    backgroundColor: state.settings.theme.backgroundColor,
    negativeColor: state.settings.theme.negativeColor,
});

export default connect(mapStateToProps)(Dropdown);
