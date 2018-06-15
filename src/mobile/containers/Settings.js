import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import KeepAwake from 'react-native-keep-awake';
import SettingsContent from '../components/SettingsContent';
import { height } from '../utils/dimensions';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    settingsContainer: {
        flex: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        zIndex: 1,
        paddingVertical: height / 40,
    },
});

/** Settings component */
class Settings extends Component {
    static propTypes = {
        /** Currently selected setting */
        currentSetting: PropTypes.string.isRequired,
        /** Determines if wallet is manually syncing account information */
        isSyncing: PropTypes.bool.isRequired,
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Close active top bar */
        closeTopBar: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('Settings');
    }

    componentWillReceiveProps(newProps) {
        if (!this.props.isSyncing && newProps.isSyncing) {
            KeepAwake.activate();
        } else if (this.props.isSyncing && !newProps.isSyncing) {
            KeepAwake.deactivate();
        }
    }

    getChildrenProps(child) {
        const props = {
            nodeSelection: {
                backPress: () => this.props.setSetting('advancedSettings'),
            },
            addCustomNode: {
                backPress: () => this.props.setSetting('advancedSettings'),
            },
            addExistingSeed: {
                navigator: this.props.navigator,
            },
        };

        return props[child] || {};
    }

    render() {
        const childrenProps = this.getChildrenProps(this.props.currentSetting);

        return (
            <TouchableWithoutFeedback style={styles.container} onPress={() => this.props.closeTopBar()}>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }} />
                    <View style={styles.settingsContainer}>
                        <SettingsContent
                            navigator={this.props.navigator}
                            component={this.props.currentSetting}
                            {...childrenProps}
                        />
                    </View>
                    <View style={{ flex: 1 }} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    currentSetting: state.wallet.currentSetting,
    isSyncing: state.ui.isSyncing,
});

const mapDispatchToProps = {
    setSetting,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
