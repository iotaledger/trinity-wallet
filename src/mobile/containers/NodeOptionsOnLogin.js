import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { setLoginRoute } from 'iota-wallet-shared-modules/actions/ui';
import { translate } from 'react-i18next';
import { width, height } from '../utils/dimensions';
import CtaButton from '../components/CtaButton';
import NodeSelection from '../containers/NodeSelection';
import AddCustomNode from '../containers/AddCustomNode';
import { Icon } from '../theme/icons';
import GENERAL from '../theme/general';

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
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleTextLeft: {
        color: 'white',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
});

/** Node Selection component */
class NodeOptionsOnLogin extends Component {
    static propTypes = {
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Sets which login page should be displayed
         * @param {string} route - current route
         */
        setLoginRoute: PropTypes.func.isRequired,
        /** Determines which page should be displayed at login */
        loginRoute: PropTypes.string.isRequired,
    };

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
                                    text={t('global:changeNode').toUpperCase()}
                                    onPress={() => this.props.setLoginRoute('nodeSelection')}
                                    ctaWidth={width / 1.6}
                                />
                                <View style={{ flex: 0.4 }} />
                                <CtaButton
                                    ctaColor={primary.color}
                                    ctaBorderColor={primary.hover}
                                    secondaryCtaColor={primary.body}
                                    text={t('global:addCustomNode').toUpperCase()}
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
                                    <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {loginRoute === 'nodeSelection' && (
                    <NodeSelection backPress={() => this.props.setLoginRoute('nodeOptions')} />
                )}
                {loginRoute === 'customNode' && (
                    <AddCustomNode backPress={() => this.props.setLoginRoute('nodeOptions')} />
                )}
                <View style={{ flex: 0.05 }} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    loginRoute: state.ui.loginRoute,
});

const mapDispatchToProps = {
    setLoginRoute,
};

export default translate('global')(connect(mapStateToProps, mapDispatchToProps)(NodeOptionsOnLogin));
