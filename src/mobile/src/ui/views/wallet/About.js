import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View, Text } from 'react-native';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { getVersion, getBuildNumber } from 'react-native-device-info';
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
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 25,
    },
});

/**
 * Advanced Settings component
 */
class About extends PureComponent {
    static propTypes = {
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
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
        const { theme } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.titleText, textColor]}>
                            Trinity Wallet. IOTA Foundation {this.getYear()}.
                        </Text>
                        <Text style={[styles.titleText, textColor, { paddingTop: height / 30 }]}>
                            v {getVersion()} ({getBuildNumber()})
                        </Text>
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

export default withTranslation(['global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(About),
);
