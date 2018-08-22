import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Dimensions, Keyboard } from 'react-native';
import { translate } from 'react-i18next';
import { setSetting } from 'shared/actions/wallet';
import SeedVaultExportComponent from 'ui/components/SeedVaultExportComponent';
import { Icon } from 'ui/theme/icons.js';
import GENERAL from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const { width } = Dimensions.get('window');
const { height } = global;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        width,
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topContainer: {
        flex: 11,
        justifyContent: 'center',
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
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

/** Seed Vault Setting component */
class SeedVaultSettings extends Component {
    static propTypes = {
        /** Set new setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.state = {
            step: 'isValidatingWalletPassword',
            isAuthenticated: false,
            seed: '',
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('SeedVaultSettings');
    }

    render() {
        const { t, theme } = this.props;
        const { step, isAuthenticated, seed } = this.state;
        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <SeedVaultExportComponent
                            step={step}
                            setProgressStep={(step) => this.setState({ step })}
                            goBack={() => this.props.setSetting('mainSettings')}
                            onRef={(ref) => {
                                this.SeedVaultExportComponent = ref;
                            }}
                            isAuthenticated={isAuthenticated}
                            setAuthenticated={() => this.setState({ isAuthenticated: true })}
                            seed={seed}
                            setSeed={(seed) => this.setState({ seed })}
                        />
                        <View style={{ flex: 0.2 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.SeedVaultExportComponent.onBackPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={bodyColor} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() =>
                                step === 'isExporting'
                                    ? this.SeedVaultExportComponent.onExportPress()
                                    : this.SeedVaultExportComponent.onNextPress()
                            }
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>
                                    {step === 'isExporting' ? t('global:export') : t('global:next')}
                                </Text>
                                <Icon name="tick" size={width / 28} color={bodyColor} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setSetting,
};

export default translate(['seedVault', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SeedVaultSettings));
