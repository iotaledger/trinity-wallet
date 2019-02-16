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
import withNodeData from 'shared-modules/containers/settings/Node';
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
     * Adds custom node
     *
     * @method addNode
     */
    addNode() {
        const { customNode } = this.state;

        this.props.setNode(customNode, true);
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
        const { t, theme, loading } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 1.2 }} />
                        <CustomTextInput
                            label={t('customNode')}
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
                        />
                    </View>
                    {loading ? (
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
                        {!loading && this.renderBackPressOption()}
                        {!loading && this.renderAddCustomNodeOption()}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default withNamespaces(['addCustomNode', 'global'])(withNodeData(AddCustomNode));
