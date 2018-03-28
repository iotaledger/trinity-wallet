import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import KeepAwake from 'react-native-keep-awake';
import SettingsContent from '../components/SettingsContent';
import { height } from '../utils/dimensions';

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
        setSetting: PropTypes.func.isRequired
    };

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
                backPress: () => this.props.setSetting('advancedSettings')
            }
        };

        return props[child] || {};
    }

    render() {
        const childrenProps = this.getChildrenProps(this.props.currentSetting);

        return (
            <View style={styles.container}>
                <View style={{ flex: 1 }} />
                <View style={styles.settingsContainer}>
                    <SettingsContent component={this.props.currentSetting} {...childrenProps} />
                </View>
                <View style={{ flex: 1 }} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    currentSetting: state.wallet.currentSetting,
    isSyncing: state.ui.isSyncing,
});

const mapDispatchToProps = {
    setSetting
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
