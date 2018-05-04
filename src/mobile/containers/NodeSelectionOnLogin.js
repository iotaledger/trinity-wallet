import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { translate } from 'react-i18next';
import { width, height } from '../utils/dimensions';
import CtaButton from '../components/CtaButton';
import NodeSelection from '../containers/NodeSelection';
import AddCustomNode from '../containers/AddCustomNode';
import { Icon } from '../theme/icons';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    topContainer: {
        flex: 9,
        justifyContent: 'center',
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
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        color: 'white',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

/** Node Selection component */
class NodeSelectionOnLogin extends Component {
    static propTypes = {
        /** Navigate to previous screen */
        backPress: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

    static defaultProps = {
        renderCustomNodeSelection: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            settingCustomNode: false,
            changingNode: false,
        };
    }

    render() {
        const { t, theme: { body, primary } } = this.props;
        const { settingCustomNode, changingNode } = this.state;
        const textColor = { color: body.color };

        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 0.3 }} />
                {!settingCustomNode &&
                    !changingNode && (
                        <View style={styles.container}>
                            <View style={styles.topContainer}>
                                <View>
                                    <CtaButton
                                        ctaColor={primary.color}
                                        ctaBorderColor={primary.hover}
                                        secondaryCtaColor={primary.body}
                                        text={t('global:changeNode').toUpperCase()}
                                        onPress={() => {
                                            this.setState({ changingNode: true });
                                        }}
                                        ctaWidth={width / 1.6}
                                    />
                                    <View style={{ flex: 0.4 }} />
                                    <CtaButton
                                        ctaColor={primary.color}
                                        ctaBorderColor={primary.hover}
                                        secondaryCtaColor={primary.body}
                                        text={t('global:addCustomNode').toUpperCase()}
                                        onPress={() => {
                                            this.setState({ settingCustomNode: true });
                                        }}
                                        ctaWidth={width / 1.6}
                                    />
                                </View>
                            </View>
                            <View style={styles.bottomContainer}>
                                <TouchableOpacity
                                    onPress={() => this.props.backPress()}
                                    hitSlop={{
                                        top: height / 55,
                                        bottom: height / 55,
                                        left: width / 55,
                                        right: width / 55,
                                    }}
                                >
                                    <View style={styles.itemLeft}>
                                        <Icon name="chevronLeft" size={width / 28} color={body.color} />
                                        <Text style={[styles.titleTextLeft, textColor]}>
                                            {t('global:backLowercase')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                {changingNode && <NodeSelection backPress={() => this.setState({ changingNode: false })} />}
                {settingCustomNode && <AddCustomNode backPress={() => this.setState({ settingCustomNode: false })} />}
                <View style={{ flex: 0.05 }} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default translate('global')(connect(mapStateToProps, null)(NodeSelectionOnLogin));
