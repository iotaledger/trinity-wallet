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
    dropdownTitle: {
        color: '#F7D002',
        fontFamily: 'Lato-Regular',
        fontSize: width / 33,
        backgroundColor: 'transparent',
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
    selected: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingBottom: height / 150,
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
        const { options, title, dropdownWidth } = this.props;
        const { isDropdownOpen, selectedOption } = this.state;
        const triangleDirection = isDropdownOpen ? 'up' : 'down';
        const dropdownHeight = isDropdownOpen ? height / 3.2 : 0;

        return (
            <View style={styles.container}>
                <Text style={styles.dropdownTitle}>{title}</Text>
                <View style={styles.dropdownButtonContainer}>
                    <TouchableWithoutFeedback onPress={() => this.onDropdownTitlePress()}>
                        <View style={[styles.dropdownButton, dropdownWidth]}>
                            <Text numberOfLines={1} style={styles.selected}>
                                {selectedOption}
                            </Text>
                            <Triangle
                                width={10}
                                height={10}
                                color={'white'}
                                direction={triangleDirection}
                                style={{ marginBottom: height / 80 }}
                            />
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <View
                    style={[
                        {
                            height: dropdownHeight,
                            overflow: 'hidden',
                            backgroundColor: 'transparent',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                        },
                        dropdownWidth,
                    ]}
                >
                    <ListView
                        dataSource={ds.cloneWithRows(options)}
                        renderRow={rowData => (
                            <TouchableOpacity
                                onPress={() => this.onOptionPress(rowData)}
                                style={{ alignItems: 'flex-start', flex: 1 }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        height: height / 22.4,
                                        alignItems: 'stretch',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text numberOfLines={1} style={[styles.dropdownItem, dropdownWidth]}>
                                        {rowData}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        contentContainerView={{ flex: 1, justifyContent: 'flex-start' }}
                        enableEmptySections
                    />
                </View>
            </View>
        );
    }
}

export default Dropdown;
