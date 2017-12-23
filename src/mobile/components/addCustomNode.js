import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Dropdown from '../components/dropdown';
import { width, height } from '../util/dimensions';
import arrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left.png';
import addImagePath from 'iota-wallet-shared-modules/images/add.png';
import { TextField } from 'react-native-material-textfield';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topContainer: {
        flex: 9,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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

class AddCustomNode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            customNode: '',
        };
    }

    addNode() {
        const {
            setNode,
            checkNode,
            backPress,
            currentNode,
            onAddNodeError,
            onAddNodeSuccess,
            nodes,
            onDuplicateNodeError,
        } = this.props;
        const { customNode } = this.state;

        if (!nodes.includes(customNode)) {
            setNode(customNode);
            checkNode((error, success) => {
                if (error) {
                    onAddNodeError();
                    setNode(currentNode);
                } else {
                    onAddNodeSuccess(customNode);
                    backPress();
                }
            });
        } else {
            onDuplicateNodeError();
        }
    }

    render() {
        const { node, nodes, backPress, t } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.2 }} />
                        <TextField
                            style={{ color: 'white', fontFamily: 'Lato-Light' }}
                            labelTextStyle={{ fontFamily: 'Lato-Light' }}
                            labelFontSize={width / 31.8}
                            fontSize={width / 20.7}
                            labelPadding={3}
                            baseColor="white"
                            label="Custom node"
                            tintColor="#F7D002"
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically={true}
                            returnKeyType="done"
                            value={this.state.accountName}
                            onChangeText={customNode => this.setState({ customNode })}
                            containerStyle={{
                                width: width / 1.4,
                            }}
                            onSubmitEditing={() => this.addNode()}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={() => backPress()}>
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                        {this.state.customNode.startsWith('http') && (
                            <TouchableOpacity onPress={() => this.addNode()}>
                                <View style={styles.itemRight}>
                                    <Image source={addImagePath} style={styles.icon} />
                                    <Text style={styles.titleText}>Add</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default AddCustomNode;
