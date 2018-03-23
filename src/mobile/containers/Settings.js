import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
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

class Settings extends Component {
    static propTypes = {
        currentSetting: PropTypes.string.isRequired,
        isSyncing: PropTypes.bool.isRequired,
    };

    componentWillReceiveProps(newProps) {
        if (!this.props.isSyncing && newProps.isSyncing) {
            KeepAwake.activate();
        } else if (this.props.isSyncing && !newProps.isSyncing) {
            KeepAwake.deactivate();
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{ flex: 1 }} />
                <View style={styles.settingsContainer}>
                    <SettingsContent component={this.props.currentSetting} />
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

export default connect(mapStateToProps)(Settings);
