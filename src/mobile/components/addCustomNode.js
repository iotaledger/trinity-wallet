import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { width, height } from '../util/dimensions';
import CustomTextInput from '../components/customTextInput';
import { translate } from 'react-i18next';
import THEMES from '../theme/themes';

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
    iconLeft: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    iconRight: {
        width: width / 28,
        height: width / 28,
    },
    titleTextRight: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
    dropdownWidth: {
        width: width / 1.5,
    },
});

class AddCustomNode extends Component {
    static propTypes = {
        nodes: PropTypes.array.isRequired,
        currentNode: PropTypes.string.isRequired,
        onDuplicateNodeError: PropTypes.func.isRequired,
        checkNode: PropTypes.func.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        textColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.object.isRequired,
    };

    constructor() {
        super();

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
        const {
            node,
            nodes,
            backPress,
            t,
            secondaryBackgroundColor,
            textColor,
            arrowLeftImagePath,
            addImagePath,
            negativeColor,
        } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.3 }} />
                        <CustomTextInput
                            label={t('customNode')}
                            negativeColor={negativeColor}
                            onChangeText={(customNode) => this.setState({ customNode })}
                            containerStyle={{ width: width / 1.36 }}
                            autoCapitalize={'none'}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            onSubmitEditing={() => this.addNode()}
                            secondaryBackgroundColor={secondaryBackgroundColor}
                            negativeColor={negativeColor}
                            value={this.state.accountName}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => backPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.iconLeft} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        {this.state.customNode.startsWith('http') && (
                            <TouchableOpacity
                                onPress={() => this.addNode()}
                                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                            >
                                <View style={styles.itemRight}>
                                    <Text style={[styles.titleTextRight, textColor]}>{t('add')}</Text>
                                    <Image source={addImagePath} style={styles.iconRight} />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['addCustomNode', 'global'])(AddCustomNode);
