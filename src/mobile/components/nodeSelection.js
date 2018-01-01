import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Dropdown from '../components/dropdown';
import { width, height } from '../util/dimensions';
import arrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left.png';
import tickImagePath from 'iota-wallet-shared-modules/images/tick.png';
import { translate } from 'react-i18next';

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
        paddingVertical: height / 50,
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-end',
    },
    icon: {
        width: width / 22,
        height: width / 22,
        marginRight: width / 25,
    },
    titleText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    dropdownWidth: {
        width: width / 1.5,
    },
});

class NodeSelection extends Component {
    static propTypes = {
        node: PropTypes.string.isRequired,
        nodes: PropTypes.array.isRequired,
        backPress: PropTypes.func.isRequired,
        setNode: PropTypes.func.isRequired,
    };

    saveNodeSelection() {
        const { setNode, backPress } = this.props;

        setNode(this.dropdown.getSelected());
        backPress();
    }

    render() {
        const { node, nodes, backPress, t } = this.props;

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
                        <View style={{ flex: 0.2 }} />
                        <Dropdown
                            onRef={c => {
                                this.dropdown = c;
                            }}
                            title={t('global:node')}
                            dropdownWidth={styles.dropdownWidth}
                            defaultOption={node}
                            options={nodes}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={() => backPress()}>
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.saveNodeSelection()}>
                            <View style={styles.itemRight}>
                                <Image source={tickImagePath} style={styles.icon} />
                                <Text style={styles.titleText}>{t('global:save')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate('global')(NodeSelection);
