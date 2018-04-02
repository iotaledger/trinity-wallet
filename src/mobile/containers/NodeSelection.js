import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { setFullNode } from 'iota-wallet-shared-modules/actions/settings';
import { translate } from 'react-i18next';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';
import DropdownComponent from '../containers/Dropdown';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topContainer: {
        flex: 9,
        justifyContent: 'flex-end',
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
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

/** Node Selection component */
class NodeSelection extends Component {
    static propTypes = {
        /** Currently selected IRI node */
        node: PropTypes.string.isRequired,
        /** Available IRI nodes */
        nodes: PropTypes.array.isRequired,
        /** Navigate to previous screen */
        backPress: PropTypes.func.isRequired,
        /** Set new IRI node
         * @param {string} node
         */
        setFullNode: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

    setNode(selectedNode) {
        changeIotaNode(selectedNode);
        this.props.setFullNode(selectedNode);
    }

    saveNodeSelection() {
        this.setNode(this.dropdown.getSelected());
        this.props.backPress();
    }

    render() {
        const { node, nodes, t, theme: { body } } = this.props;
        const textColor = { color: body.color };

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
                            options={nodes}
                            background
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.backPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={body.color} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.saveNodeSelection()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:save')}</Text>
                                <Icon name="tick" size={width / 28} color={body.color} />
                            </View>
                        </TouchableOpacity>
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
});

const mapDispatchToProps = {
    setFullNode,
};

export default translate('global')(connect(mapStateToProps, mapDispatchToProps)(NodeSelection));
