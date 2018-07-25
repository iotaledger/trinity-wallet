import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import { Icon } from '../theme/icons.js';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 25,
    },
    backText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    itemContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width,
        paddingHorizontal: width / 15,
    },
});

/**
 * Advanced Settings component
 */
class AdvancedSettings extends PureComponent {
    static propTypes = {
        /** Change current setting
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

    componentDidMount() {
        leaveNavigationBreadcrumb('About');
    }

    getYear() {
        const date = new Date();
        return date.getFullYear();
    }

    render() {
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;

        return (
            <View style={styles.container}>
                <View style={{ flex: 7, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={[styles.titleText, textColor, { marginTop: height / 15 }]}>
                        Trinity Wallet. IOTA Foundation {this.getYear()}.
                    </Text>
                    <Text style={[styles.titleText, textColor, { paddingTop: height / 30 }]}>
                        v {getVersion()} ({getBuildNumber()})
                    </Text>
                </View>
                <View style={{ flex: 3, justifyContent: 'flex-end' }}>
                    <View style={{ flex: 2 }} />
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('mainSettings')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="chevronLeft" size={width / 28} color={bodyColor} />
                                <Text style={[styles.backText, textColor]}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setSetting,
};

export default translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(AdvancedSettings));
