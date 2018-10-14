import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { setLoginRoute } from 'shared-modules/actions/ui';
import { setFullNode } from 'shared-modules/actions/settings';
import { withNamespaces } from 'react-i18next';
import DropdownComponent from 'ui/components/Dropdown';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topContainer: {
        flex: 11,
        justifyContent: 'flex-end',
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
        color: 'white',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        color: 'white',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        position: 'absolute',
        bottom: height / 4.5,
        alignItems: 'center',
    },
});

/** Node Selection component */
class NodeSelection extends Component {
    static propTypes = {
        /** @ignore */
        node: PropTypes.string.isRequired,
        /** @ignore */
        nodes: PropTypes.array.isRequired,
        /** Navigate to previous screen */
        backPress: PropTypes.func.isRequired,
        /** @ignore */
        setFullNode: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isChangingNode: PropTypes.bool.isRequired,
        /** @ignore */
        setLoginRoute: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            node: this.props.node,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('NodeSelection');
    }

    componentWillReceiveProps(newProps) {
        const { node } = this.props;
        if (node !== newProps.node) {
            this.props.setLoginRoute('login');
        }
    }

    setNode(selectedNode) {
        this.props.setFullNode(selectedNode);
    }

    saveNodeSelection() {
        const { node } = this.props;
        const nextNode = this.dropdown.getSelected();
        if (nextNode === node) {
            return;
        }
        this.setNode(nextNode);
    }

    hasChangedNode() {
        return this.state.node !== this.props.node;
    }

    render() {
        const { isChangingNode, node, nodes, t, theme: { body, primary } } = this.props;
        const textColor = { color: body.color };
        const hasChangedNode = this.hasChangedNode();

        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if (this.dropdown) {
                        this.dropdown.closeDropdown();
                    }
                }}
            >
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.25 }} />
                        <DropdownComponent
                            onRef={(c) => {
                                this.dropdown = c;
                            }}
                            title={t('global:node')}
                            dropdownWidth={{ width: width / 1.5 }}
                            defaultOption={node}
                            saveSelection={(node) => this.setState({ node })}
                            options={nodes}
                            background
                        />
                        {isChangingNode && (
                            <View style={styles.innerContainer}>
                                <ActivityIndicator
                                    animating
                                    style={styles.activityIndicator}
                                    size="large"
                                    color={primary.color}
                                />
                            </View>
                        )}
                        <View style={{ flex: 0.25 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.backPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={body.color} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                        {hasChangedNode && (
                            <TouchableOpacity
                                onPress={() => this.saveNodeSelection()}
                                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                            >
                                <View style={styles.itemRight}>
                                    <Text style={[styles.titleTextRight, textColor]}>{t('global:save')}</Text>
                                    <Icon name="tick" size={width / 28} color={body.color} />
                                </View>
                            </TouchableOpacity>
                        )}
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
    isChangingNode: state.ui.isChangingNode,
});

const mapDispatchToProps = {
    setFullNode,
    setLoginRoute,
};

export default withNamespaces('global')(connect(mapStateToProps, mapDispatchToProps)(NodeSelection));
