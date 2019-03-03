import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { setLoginRoute } from 'shared-modules/actions/ui';
import { withNamespaces } from 'react-i18next';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { width, height } from 'libs/dimensions';
import CtaButton from 'ui/components/CtaButton';
import NodeSelection from 'ui/views/wallet/NodeSelection';
import AddCustomNodeComponent from 'ui/views/wallet/AddCustomNode';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    topContainer: {
        flex: 11,
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
    titleTextLeft: {
        color: 'white',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
});

/** Node Selection component */
class NodeOptionsOnLogin extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        setLoginRoute: PropTypes.func.isRequired,
        /** Login route */
        loginRoute: PropTypes.string.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('NodeOptionsOnLogin');
    }

    render() {
        const { t, loginRoute, theme: { body, primary } } = this.props;
        const textColor = { color: body.color };
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 0.3 }} />
                {loginRoute === 'nodeOptions' && (
                    <View style={styles.container}>
                        <View style={styles.topContainer}>
                            <View>
                                <CtaButton
                                    ctaColor={primary.color}
                                    ctaBorderColor={primary.hover}
                                    secondaryCtaColor={primary.body}
                                    text={t('global:changeNode')}
                                    onPress={() => this.props.setLoginRoute('nodeSelection')}
                                    ctaWidth={width / 1.6}
                                />
                                <View style={{ flex: 0.4 }} />
                                <CtaButton
                                    ctaColor={primary.color}
                                    ctaBorderColor={primary.hover}
                                    secondaryCtaColor={primary.body}
                                    text={t('global:addCustomNode')}
                                    onPress={() => this.props.setLoginRoute('customNode')}
                                    ctaWidth={width / 1.6}
                                />
                            </View>
                        </View>
                        <View style={styles.bottomContainer}>
                            <TouchableOpacity
                                onPress={() => this.props.setLoginRoute('login')}
                                hitSlop={{
                                    top: height / 55,
                                    bottom: height / 55,
                                    left: width / 55,
                                    right: width / 55,
                                }}
                            >
                                <View style={styles.itemLeft}>
                                    <Icon name="chevronLeft" size={width / 28} color={body.color} />
                                    <Text style={[styles.titleTextLeft, textColor]}>{t('global:back')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {loginRoute === 'nodeSelection' && (
                    <NodeSelection backPress={() => this.props.setLoginRoute('nodeOptions')} />
                )}
                {loginRoute === 'customNode' && (
                    <AddCustomNodeComponent backPress={() => this.props.setLoginRoute('nodeOptions')} />
                )}
                <View style={{ flex: 0.05 }} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    setLoginRoute,
};

export default withNamespaces('global')(connect(mapStateToProps, mapDispatchToProps)(NodeOptionsOnLogin));
