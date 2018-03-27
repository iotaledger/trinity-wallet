import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { changeIotaNode, checkNode } from 'iota-wallet-shared-modules/libs/iota';
import { setFullNode, addCustomPoWNode } from 'iota-wallet-shared-modules/actions/settings';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
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

/**
 * Add Custom Node component
 */
class AddCustomNode extends Component {
    static propTypes = {
        /** Available IRI nodes */
        nodes: PropTypes.array.isRequired,
        /** Currently selected IRI node */
        node: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Set node
         * @param {string} node
         */
        setFullNode: PropTypes.func.isRequired,
         /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Translation helper
        * @param {string} translationString - locale string identifier to be translated
        */
        t: PropTypes.func.isRequired,
         /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Add custom node to the list of available nodes
         * @param {string} customNode
         */
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
        const { node, nodes } = this.props;

        const { customNode } = this.state;

        if (!customNode.startsWith('http')) {
            return this.onAddNodeError();
        }

        if (!nodes.includes(customNode.replace(/ /g, ''))) {
            this.setNode(customNode);

            checkNode((error) => {
                if (error) {
                    this.onAddNodeError();
                    this.setNode(node);
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
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;

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
    nodes: state.settings.nodes,
    node: state.settings.node,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setFullNode,
    generateAlert,
    addCustomPoWNode,
    setSetting,
};

export default translate(['addCustomNode', 'global'])(connect(mapStateToProps, mapDispatchToProps)(AddCustomNode));
