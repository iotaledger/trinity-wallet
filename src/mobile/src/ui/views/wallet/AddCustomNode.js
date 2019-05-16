import map from 'lodash/map';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    Animated
} from 'react-native';
import withNodeData from 'shared-modules/containers/settings/Node';
import { setSetting } from 'shared-modules/actions/wallet';
import { setLoginRoute } from 'shared-modules/actions/ui';
import { withNamespaces } from 'react-i18next';
import { width } from 'libs/dimensions';
import { connect } from 'react-redux';
import CustomTextInput from 'ui/components/CustomTextInput';
import SettingsSeparator from 'ui/components/SettingsSeparator';
import SettingsDualFooter from 'ui/components/SettingsDualFooter';
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
        flex: 11,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width
    },
    bottomContainer: {
        flex: 1,
    },
    fieldsContainer: {
        justifyContent: 'flex-start',
        width,
        paddingHorizontal: (width - Styling.contentWidth) / 2
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
    },
    buttonText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize2,
        paddingLeft: width / 50
    }
});

/**
 * Add Custom Node component
 */
export class AddCustomNode extends Component {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        loading: PropTypes.bool.isRequired,
        /** @ignore */
        customNodes: PropTypes.array.isRequired,
        /** @ignore */
        setNode: PropTypes.func.isRequired,
        /** @ignore */
        removeCustomNode: PropTypes.func.isRequired,
        /** @ignore */
        setLoginRoute: PropTypes.func.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        loginRoute: PropTypes.string.isRequired,
    };

    constructor() {
        super();
        this.state = {
            customNode: '',
            authKey: '',
            textInputFlex: new Animated.Value(2.5),
            nodeListFlex: new Animated.Value(7),
            viewAuthKeyButton: true,
            viewAuthKeyField: false
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('AddCustomNode');
    }

    /**
     * Updates layout and toggles auth key field visibility
     *
     * @method onAuthKeypress
     */
    onAuthKeypress() {
        const { textInputFlex, nodeListFlex, viewAuthKeyButton, viewAuthKeyField } = this.state;
        this.setState({ viewAuthKeyButton: !viewAuthKeyButton });
        Animated.parallel([
            Animated.timing(textInputFlex, {
                toValue: viewAuthKeyField ? 2.5 : 4,
                duration: 200,
            }),
            Animated.timing(nodeListFlex, {
                toValue: viewAuthKeyField ? 6.5 : 5,
                duration: 200,
            }),
        ]).start(() => {
            this.setState({ viewAuthKeyField: !this.state.viewAuthKeyField, authKey: '' });
        });
    }

    renderCustomNodes() {
        const { theme, customNodes } = this.props;
        const { nodeListHeight } = this.state;

        return (map(customNodes, (node, index) => {
            return (
                <View key={index} style={{ height: nodeListHeight / 7, width, flexDirection: 'row', paddingHorizontal: width / 15, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'SourceSansPro-Light', fontSize: Styling.fontSize3, color: theme.body.color }}>
                        {node}
                    </Text>
                    <TouchableOpacity onPress={() => this.props.removeCustomNode(node)}>
                        <Icon name="cross" size={width / 28} color={theme.body.color} />
                    </TouchableOpacity>
                </View>
            );
        }));
    }

    render() {
        const { t, theme, customNodes, loading, loginRoute } = this.props;
        const { nodeListHeight, textInputFlex, nodeListFlex, viewAuthKeyButton, viewAuthKeyField, customNode } = this.state;
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <Animated.View style={[ styles.fieldsContainer, { flex: textInputFlex } ]}>
                            <View style={{ flex: 2 }}/>
                            <View style={{ position: 'absolute', width, alignItems: 'center' }}>
                                <CustomTextInput
                                    label={t('advancedSettings:addCustomNode')}
                                    onValidTextChange={(customNode) => this.setState({ customNode })}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    keyboardType={isIOS ? 'url' : 'default'}
                                    onSubmitEditing={() => this.props.setNode(customNode, true)}
                                    theme={theme}
                                    editable={!loading}
                                    value={this.state.customNode}
                                    loading={loading}
                                />
                            </View>
                            { viewAuthKeyField &&
                            <View style={{ flex: 2, justifyContent: 'flex-start' }}>
                                <CustomTextInput
                                    label={t('addAuthKey')}
                                    onValidTextChange={(authKey) => this.setState({ authKey })}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    keyboardType={isIOS ? 'url' : 'default'}
                                    onSubmitEditing={() => this.addNode()}
                                    theme={theme}
                                    editable={!loading}
                                    value={this.state.authKey}
                                />
                            </View>
                            ||
                            <TouchableOpacity onPress={() => this.onAuthKeypress()} style={{flex: 1, justifyContent: 'flex-end' }}>
                                { viewAuthKeyButton &&
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                    <Icon name="plusAlt" size={width / 40} color={theme.body.color} />
                                    <Text style={[ styles.buttonText, { color: theme.body.color } ]}>Add auth key</Text>
                                </View>
                                }
                            </TouchableOpacity>
                          }
                        </Animated.View>
                        <SettingsSeparator color={theme.body.color}/>
                        { customNodes.length > 0 &&
                        <Animated.View style={{ flex: nodeListFlex }}>
                            <View style={{ flex: 1, width }} onLayout={(e) => !nodeListHeight && this.setState({ nodeListHeight: e.nativeEvent.layout.height }) }>
                                <ScrollView style={{ width, maxHeight: nodeListHeight }} scrollEnabled>
                                    <View style={{ flex: 1 }} onStartShouldSetResponder={() => true}>
                                        {this.renderCustomNodes()}
                                        {customNodes.length < 7 && <View style={{ height: 7 - customNodes.length / nodeListHeight }} />}
                                    </View>
                                </ScrollView>
                            </View>
                        </Animated.View>
                        ||
                        <View style={{ flex: nodeListFlex.__getValue(), justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={[styles.infoText, { color: theme.body.color }]}>No custom nodes added</Text>
                        </View>
                        }
                        <View style={{ flex: 0.5 }}/>
                    </View>
                    <View style={styles.bottomContainer}>
                        <SettingsDualFooter
                            theme={theme}
                            backFunction={() => loginRoute === 'addCustomNode' ? this.props.setLoginRoute('nodeSettings') : this.props.setSetting('nodeSettings')}
                            actionFunction={() => this.props.setNode(this.state.customNode, true)}
                            actionName={t('add')}
                            actionButtonLoading={loading}
                            hideActionButton={customNode === ''}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    loginRoute: state.ui.loginRoute
});

const mapDispatchToProps = {
    setSetting,
    setLoginRoute
};

export default withNamespaces(['addCustomNode', 'global'])(
    withNodeData(connect(mapStateToProps, mapDispatchToProps)(AddCustomNode)),
);
