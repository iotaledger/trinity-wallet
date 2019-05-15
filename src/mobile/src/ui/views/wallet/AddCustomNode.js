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
import { withNamespaces } from 'react-i18next';
import { width, height } from 'libs/dimensions';
import CustomTextInput from 'ui/components/CustomTextInput';
import SettingsSeparator from 'ui/components/SettingsSeparator';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import { isIOS } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import timer from 'react-native-timer';

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
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fieldsContainer: {
        justifyContent: 'flex-start',
        width,
        paddingHorizontal: (width - Styling.contentWidth) / 2
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

const customNodes = [
    'https://nodes.iota.org',
    'https://nodes.thetangle.org:443',
    'https://iotanode.us:443',
    'https://pool.trytes.eu',
    'https://pow.iota.community:443',
    'https://nodes.mrnodes.org:443',
    'https://thenodeman.com:443',
    'https://i.love.nodes',
    'https://woo.another.node:443',
];

/**
 * Add Custom Node component
 */
export class AddCustomNode extends Component {
    static propTypes = {
        /** @ignore */
        node: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Navigate to previous screen */
        backPress: PropTypes.func,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setNode: PropTypes.func.isRequired,
        /** @ignore */
        loading: PropTypes.bool.isRequired,
        /** @ignore */
        customNodes: PropTypes.array.isRequired,
    };

    constructor() {
        super();

        this.state = {
            customNode: '',
            authKey: '',
            customNodes,
            textInputFlex: new Animated.Value(2.5),
            nodeListFlex: new Animated.Value(7),
            viewAuthKeyButton: true,
            viewAuthKeyField: false
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

    /**
     * Adds custom node
     *
     * @method addNode
     */
    addNode() {
        const { customNode, viewAuthKeyButton } = this.state;
        this.setState({ loading: true });
        timer.setTimeout('timeout',
            () => {
              if (!viewAuthKeyButton) {
                  this.onAuthKeypress();
              }
              this.setState({
                  loading: false,
                  customNodes: [...this.state.customNodes, customNode],
                  customNode: ''
              });
            },
            1000
        );
        //this.props.setNode(customNode, true);
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

    renderCustomNodes() {
        const { theme } = this.props;
        const { nodeListHeight } = this.state;

        return (map(this.state.customNodes, (node, index) => {
            return (
                <View key={index} style={{ height: nodeListHeight / 7, width, flexDirection: 'row', paddingHorizontal: width / 15, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'SourceSansPro-Light', fontSize: Styling.fontSize3, color: theme.body.color }}>
                        {node}
                    </Text>
                    <TouchableOpacity onPress={() => this.setState({ customNodes: this.state.customNodes.filter((value) => value !== node) })}>
                        <Icon name="cross" size={width / 28} color={theme.body.color} />
                    </TouchableOpacity>
                </View>
            );
        }));
    }

    render() {
        const { t, theme } = this.props;
        const { nodeListHeight, loading, customNodes, textInputFlex, nodeListFlex, viewAuthKeyButton, viewAuthKeyField } = this.state;
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
                                    onSubmitEditing={() => this.addNode()}
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
                        {!loading && this.renderBackPressOption()}
                        {!loading && this.renderAddCustomNodeOption()}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default withNamespaces(['addCustomNode', 'global'])(withNodeData(AddCustomNode));
