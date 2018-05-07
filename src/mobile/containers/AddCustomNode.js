import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    ActivityIndicator,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { connect } from 'react-redux';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';
import { getNodeInfoAsync as checkNode } from 'iota-wallet-shared-modules/libs/iota/extendedApi';
import { setFullNode, addCustomPoWNode } from 'iota-wallet-shared-modules/actions/settings';
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
        flex: 4,
        justifyContent: 'flex-start',
    },
    innerContainer: {
        flex: 5,
        justifyContent: 'center',
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
        fontFamily: 'SourceSansPro-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
    dropdownWidth: {
        width: width / 1.5,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height / 40,
    },
});

/**
 * Add Custom Node component
 */
class AddCustomNode extends Component {
    static propTypes = {
        /** Available IRI nodes */
        nodes: PropTypes.array.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Set node
         * @param {string} node
         */
        setFullNode: PropTypes.func.isRequired,
        /** Navigate to previous screen */
        backPress: PropTypes.func.isRequired,
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
            isCheckingNode: false,
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

    onAddHttpNodeError() {
        return this.props.generateAlert(
            'error',
            'Custom node could not be added',
            'Trinity Mobile only supports https nodes.',
        );
    }

    onEmptyFieldError() {
        const { t } = this.props;
        return this.props.generateAlert('error', t('nodeFieldEmpty'), t('nodeFieldEmptyExplanation'));
    }

    setNode(selectedNode) {
        changeIotaNode(selectedNode);
        this.props.setFullNode(selectedNode);
    }

    addNode() {
        const { nodes } = this.props;

        const { customNode } = this.state;

        if (!customNode.match(/^[.a-zA-Z0-9:/-]+$/)) {
            return this.onEmptyFieldError();
        }

        if (!customNode.startsWith('http')) {
            return this.onAddNodeError();
        }

        if (customNode.startsWith('http://')) {
            return this.onAddHttpNodeError();
        }

        if (!nodes.includes(customNode.replace(/ /g, ''))) {
            this.setState({ isCheckingNode: true });

            checkNode(customNode)
                .then(() => {
                    this.setState({ isCheckingNode: false });
                    this.onAddNodeSuccess(customNode);
                    this.setNode(customNode);
                    this.props.backPress();
                })
                .catch(() => {
                    this.setState({ isCheckingNode: false });
                    this.onAddNodeError();
                });
        } else {
            this.onDuplicateNodeError();
        }
    }

    renderBackPressOption() {
        const { t, theme } = this.props;

        return (
            <TouchableOpacity
                onPress={() => this.props.backPress()}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.itemLeft}>
                    <Icon name="chevronLeft" size={width / 28} color={theme.body.color} />
                    <Text style={[styles.titleTextLeft, { color: theme.body.color }]}>{t('global:backLowercase')}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    renderAddCustomNodeOption() {
        const { t, theme } = this.props;

        return (
            <TouchableOpacity
                onPress={() => this.addNode()}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.itemRight}>
                    <Text style={[styles.titleTextRight, { color: theme.body.color }]}>{t('add')}</Text>
                    <Icon name="tick" size={width / 28} color={theme.body.color} />
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        const { t, theme } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 1.2 }} />
                        <CustomTextInput
                            label={t('customNode')}
                            onChangeText={(customNode) => this.setState({ customNode })}
                            containerStyle={{ width: width / 1.2 }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            onSubmitEditing={() => this.addNode()}
                            theme={theme}
                        />
                    </View>
                    {this.state.isCheckingNode ? (
                        <View style={styles.innerContainer}>
                            <ActivityIndicator
                                animating
                                style={styles.activityIndicator}
                                size="large"
                                color={theme.primary.color}
                            />
                        </View>
                    ) : (
                        <View style={styles.innerContainer} />
                    )}
                    <View style={styles.bottomContainer}>
                        {!this.state.isCheckingNode && this.renderBackPressOption()}
                        {!this.state.isCheckingNode && this.renderAddCustomNodeOption()}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    nodes: state.settings.nodes,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setFullNode,
    generateAlert,
    addCustomPoWNode,
};

export default translate(['addCustomNode', 'global'])(connect(mapStateToProps, mapDispatchToProps)(AddCustomNode));
