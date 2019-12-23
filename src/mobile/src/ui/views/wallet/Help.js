import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import SettingsBackButton from 'ui/components/SettingsBackButton';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomContainer: {
        flex: 1,
    },
    topContainer: {
        flex: 11,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    titleText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        marginLeft: width / 25,
        textDecorationLine: 'underline'
    },
});

/**
 * Advanced Settings component
 */
class Help extends PureComponent {
    static propTypes = {
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('About');
    }

    /**
     * Gets current year
     *
     * @method getYear
     * @returns {number}
     */
    getYear() {
        const date = new Date();
        return date.getFullYear();
    }

    render() {
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => Linking.openURL('https://docs.iota.org/docs/wallets/0.1/trinity/introduction/overview')}>
                            <Text style={[styles.titleText, textColor]}>
                                {t('help:docsSite')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://trinity.iota.org/help/')}>
                            <Text style={[styles.titleText, textColor, { paddingTop: height / 25 }]}>
                                {t('help:commonIssues')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://help.moonpay.io/')}>
                            <Text style={[styles.titleText, textColor, { paddingTop: height / 25 }]}>
                                {t('help:buyingIOTA')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <SettingsBackButton theme={theme} backFunction={() => this.props.setSetting('mainSettings')} />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    setSetting,
};

export default withTranslation(['global', 'help'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(Help),
);
