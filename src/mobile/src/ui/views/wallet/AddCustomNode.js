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
import { setFullNode } from 'shared-modules/actions/settings';
import { isValidUrl, isValidHttpsUrl } from 'shared-modules/libs/utils';
import { setCustomNodeCheckStatus } from 'shared-modules/actions/ui';
import { generateAlert } from 'shared-modules/actions/alerts';
import { withNamespaces } from 'react-i18next';
import { width, height } from 'libs/dimensions';
import CustomTextInput from 'ui/components/CustomTextInput';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import { isIOS } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topContainer: {
        flex: 5,
        justifyContent: 'flex-start',
    },
    innerContainer: {
        flex: 6,
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
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
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
        /** @ignore */
        node: PropTypes.string.isRequired,
        /** @ignore */
        nodes: PropTypes.array.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        setFullNode: PropTypes.func.isRequired,
        /** Navigate to previous screen */
        backPress: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        isCheckingCustomNode: PropTypes.bool.isRequired,
    };

    constructor() {
        super();

        this.state = {
            customNode: '',
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('AddCustomNode');
    }

    componentWillReceiveProps(newProps) {
        const { node } = this.props;
        const hasChangedNode = node !== newProps.node;

        if (hasChangedNode) {
            this.props.backPress();
        }
    }

    /**
     * Generates an alert if a custom node could not added
     *
     * @method onAddNodeError
     */
    onAddNodeError() {
        return this.props.generateAlert(
            'error',
            this.props.t('addCustomNode:customNodeCouldNotBeAdded'),
            this.props.t('addCustomNode:invalidURL'),
        );
    }

    /**
     * Generates an alert if a duplicate node is added
     *
     * @method onDuplicateNodeError
     */
    onDuplicateNodeError() {
        return this.props.generateAlert(
            'error',
            this.props.t('global:nodeDuplicated'),
            this.props.t('global:nodeDuplicatedExplanation'),
        );
    }

    /**
     * Generates an alert when users adds a http node
     *
     * @method onAddHttpNodeError
     */
    onAddHttpNodeError() {
        return this.props.generateAlert(
            'error',
            this.props.t('global:nodeMustUseHTTPS'),
            this.props.t('global:nodeMustUseHTTPSExplanation'),
        );
    }

    /**
     * Generates an alert when user tries to add node with empty text field
     *
     * @method onEmptyFieldError
     */
    onEmptyFieldError() {
        const { t } = this.props;
        return this.props.generateAlert('error', t('nodeFieldEmpty'), t('nodeFieldEmptyExplanation'));
    }

    /**
     * Adds custom node
     *
     * @method addNode
     */
    addNode() {
        const { nodes } = this.props;

        let { customNode } = this.state;

        if (!customNode) {
            return this.onEmptyFieldError();
        }

        // Remove spaces and trailing slash
        customNode = customNode.replace(/ /g, '').replace(/\/$/, '');

        if (!isValidUrl(customNode)) {
            return this.onAddNodeError();
        }

        if (!isValidHttpsUrl(customNode)) {
            return this.onAddHttpNodeError();
        }

        if (!nodes.includes(customNode.replace(/ /g, ''))) {
            this.props.setFullNode(customNode, true);
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
                    <Text style={[styles.titleTextLeft, { color: theme.body.color }]}>{t('global:back')}</Text>
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
        const { t, theme, isCheckingCustomNode } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 1.2 }} />
                        <CustomTextInput
                            label={t('customNode')}
                            onChangeText={(customNode) => this.setState({ customNode })}
                            containerStyle={{ width: Styling.contentWidth }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            keyboardType={isIOS ? 'url' : 'default'}
                            onSubmitEditing={() => this.addNode()}
                            theme={theme}
                            editable={!isCheckingCustomNode}
                        />
                    </View>
                    {this.props.isCheckingCustomNode ? (
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
                        {!this.props.isCheckingCustomNode && this.renderBackPressOption()}
                        {!this.props.isCheckingCustomNode && this.renderAddCustomNodeOption()}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    node: state.settings.node,
    nodes: state.settings.nodes,
    theme: state.settings.theme,
    isCheckingCustomNode: state.ui.isCheckingCustomNode,
});

const mapDispatchToProps = {
    setFullNode,
    generateAlert,
    setCustomNodeCheckStatus,
};

export default withNamespaces(['addCustomNode', 'global'])(connect(mapStateToProps, mapDispatchToProps)(AddCustomNode));
