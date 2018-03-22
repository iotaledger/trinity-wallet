import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { changeIotaNode, checkNode } from 'iota-wallet-shared-modules/libs/iota';
import { setFullNode, addCustomPoWNode } from 'iota-wallet-shared-modules/actions/settings';
import { setSetting } from 'iota-wallet-shared-modules/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { translate } from 'react-i18next';
import { width, height } from '../utils/dimensions';
import CustomTextInput from '../components/CustomTextInput';
import { Icon } from '../theme/icons.js';

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
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
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
        availablePoWNodes: PropTypes.array.isRequired,
        fullNode: PropTypes.string.isRequired,
        textColor: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        setFullNode: PropTypes.func.isRequired,
        setSetting: PropTypes.func.isRequired,
        bodyColor: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        addCustomPoWNode: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            customNode: '',
        };
    }

    onAddNodeError() {
        return this.props.generateAlert(
            'error',
            'Custom node could not be added',
            'The node returned an invalid response.',
        );
    }

    onAddNodeSuccess(customNode) {
        this.props.addCustomPoWNode(customNode);

        return this.props.generateAlert('success', 'Custom node added', 'The custom node has been added successfully.');
    }

    onDuplicateNodeError() {
        return this.props.generateAlert('error', 'Duplicate node', 'The custom node is already listed.');
    }

    setNode(selectedNode) {
        changeIotaNode(selectedNode);
        this.props.setFullNode(selectedNode);
    }

    addNode() {
        const { fullNode, availablePoWNodes } = this.props;

        const { customNode } = this.state;

        if (!customNode.startsWith('http')) {
            return this.onAddNodeError();
        }

        if (!availablePoWNodes.includes(customNode.replace(/ /g, ''))) {
            this.setNode(customNode);

            checkNode((error) => {
                if (error) {
                    this.onAddNodeError();
                    this.setNode(fullNode);
                } else {
                    this.onAddNodeSuccess(customNode);
                    this.props.setSetting('advancedSettings');
                }
            });
        } else {
            this.onDuplicateNodeError();
        }
    }

    render() {
        const { t, textColor, bodyColor, theme } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.3 }} />
                        <CustomTextInput
                            label={t('customNode')}
                            onChangeText={(customNode) => this.setState({ customNode })}
                            containerStyle={{ width: width / 1.2 }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            onSubmitEditing={() => this.addNode()}
                            value={this.state.accountName}
                            theme={theme}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('advancedSettings')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={bodyColor} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.addNode()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('add')}</Text>
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
    availablePoWNodes: state.settings.availablePoWNodes,
    fullNode: state.settings.fullNode,
    negativeColor: state.settings.theme.negative,
    textColor: { color: state.settings.theme.body.color },
    bodyColor: state.settings.theme.body.color,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setFullNode,
    generateAlert,
    addCustomPoWNode,
    setSetting,
};

export default translate(['addCustomNode', 'global'])(connect(mapStateToProps, mapDispatchToProps)(AddCustomNode));
