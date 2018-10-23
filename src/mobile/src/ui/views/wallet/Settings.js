import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { setSetting } from 'shared-modules/actions/wallet';
import KeepAwake from 'react-native-keep-awake';
import SettingsContent from 'ui/components/SettingsContent';
import { height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
        /** @ignore */
        currentSetting: PropTypes.string.isRequired,
        /** @ignore */
        isSyncing: PropTypes.bool.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
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

    /**
     * Gets children props for SettingsContent component
     *
     * @param {string} child
     * @returns {object}
     */
    getChildrenProps(child) {
        const props = {
            nodeSelection: {
                backPress: () => this.props.setSetting('advancedSettings'),
            },
            addCustomNode: {
                backPress: () => this.props.setSetting('advancedSettings'),
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
