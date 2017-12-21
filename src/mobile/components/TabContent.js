import React, { Component } from 'react';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import { AppState, View } from 'react-native';
import { connect } from 'react-redux';

import { toggleTopBarDisplay } from 'iota-wallet-shared-modules/actions/home';

import Balance from '../containers/balance';
import Send from '../containers/send';
import Receive from '../containers/receive';
import History from '../containers/history';
import Settings from '../containers/settings';

const routeToComponent = {
    balance: Balance,
    send: Send,
    receive: Receive,
    history: History,
    settings: Settings,
};

class TabContent extends Component {
    componentDidMount() {
        this.startBackgroundProcesses();
    }

    componentWillUnmount() {
        this.endBackgroundProcesses();
    }

    startBackgroundProcesses() {
        AppState.addEventListener('change', this.handleAppStateChange);
        timer.setInterval('polling', () => this.startAccountPolling(), 47000);
        timer.setInterval('chartPolling', () => this.startChartPolling(), 101000);
    }

    endBackgroundProcesses() {
        AppState.removeEventListener('change', this.handleAppStateChange);
        timer.clearInterval('polling');
        timer.clearInterval('chartPolling');
    }

    handleAppStateChange = nextAppState => {
        const { onMinimise, onInactive, onMaximise } = this.props;
        if (nextAppState.match(/inactive|background/)) {
            onMinimise();
            timer.setTimeout(
                'background',
                () => {
                    onInactive();
                },
                30000,
            );
        } else if (nextAppState === 'active') {
            onMaximise();
            timer.clearTimeout('background');
        }
    };

    // todo use static func
    handleCloseTopBar = () => {
        const { isTopBarActive, toggleTopBarDisplay } = this.props;
        if (isTopBarActive) toggleTopBarDisplay();
    };

    render() {
        const { currentRoute, navigator } = this.props;

        const Content = routeToComponent[currentRoute];
        const startBackgroundProcesses = currentRoute === 'settings' ? () => this.startBackgroundProcesses() : null;
        const endBackgroundProcesses = currentRoute === 'settings' ? () => this.endBackgroundProcesses() : null;

        return (
            <View style={{ flex: 1 }}>
                <Content
                    type={currentRoute}
                    navigator={navigator}
                    closeTopBar={this.handleCloseTopBar}
                    startBackgroundProcesses={startBackgroundProcesses}
                    endBackgroundProcesses={endBackgroundProcesses}
                />
            </View>
        );
    }
}

const mapStateToProps = state => ({
    currentRoute: state.home.childRoute,
    isTopBarActive: state.home.isTopBarActive,
});

const mapDispatchToProps = {
    toggleTopBarDisplay,
};

TabContent.propTypes = {
    navigator: PropTypes.object.isRequired,
    currentRoute: PropTypes.string.isRequired,
    isTopBarActive: PropTypes.bool.isRequired,
    toggleTopBarDisplay: PropTypes.func.isRequired,
    onMinimise: PropTypes.func.isRequired,
    onInactive: PropTypes.func.isRequired,
    onMaximise: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(TabContent);
