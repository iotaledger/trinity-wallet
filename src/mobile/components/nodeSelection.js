import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Dropdown from '../components/dropdown';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textFieldContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: height / 10,
    },
    bottomContainer: {
        flex: 0.5,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-end',
    },
    icon: {
        width: width / 22,
        height: width / 22,
        marginRight: width / 25,
    },
    titleText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    dropdownWidth: {
        width: width / 1.5,
    },
});

class NodeSelection extends Component {
    saveNodeSelection() {
        const { setNode, backPress } = this.props;

        setNode(this.dropdown.getSelected());
        backPress();
    }

    render() {
        const { node, nodes, backPress } = this.props;

        return (
            <TouchableWithoutFeedback onPress={() => this.dropdown.closeDropdown()}>
                <View style={styles.container}>
                    <Dropdown
                        ref={c => {
                            this.dropdown = c;
                        }}
                        title="Node"
                        dropdownWidth={styles.dropdownWidth}
                        defaultOption={node}
                        options={nodes}
                    />
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={() => backPress()}>
                            <View style={styles.itemLeft}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/arrow-left.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.saveNodeSelection()}>
                            <View style={styles.itemRight}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/tick.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Save</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default NodeSelection;
