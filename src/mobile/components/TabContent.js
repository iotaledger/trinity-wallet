import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { toggleTopBarDisplay } from 'iota-wallet-shared-modules/actions/home';
import BalanceComponent from '../containers/Balance';
import SendComponent from '../containers/Send';
import Receive from '../containers/Receive';
import History from '../containers/History';
import Settings from '../containers/Settings';

const routeToComponent = {
    balance: BalanceComponent,
    send: SendComponent,
    receive: Receive,
    history: History,
    settings: Settings,
};

class TabContent extends Component {
    handleCloseTopBar = () => {
        const { isTopBarActive } = this.props;
        if (isTopBarActive) {
            this.props.toggleTopBarDisplay();
        }
    };

    render() {
        const { currentRoute, navigator } = this.props;
        const Content = routeToComponent[currentRoute];

        return (
            <View style={{ flex: 1 }}>
                <Content
                    type={currentRoute}
                    navigator={navigator}
                    closeTopBar={this.handleCloseTopBar}
                    onTabSwitch={(name) => this.props.onTabSwitch(name)}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    currentRoute: state.home.childRoute,
    isTopBarActive: state.home.isTopBarActive,
});

const mapDispatchToProps = {
    toggleTopBarDisplay,
};

TabContent.propTypes = {
    navigator: PropTypes.object.isRequired,
    currentRoute: PropTypes.oneOf(Object.keys(routeToComponent)),
    isTopBarActive: PropTypes.bool.isRequired,
    toggleTopBarDisplay: PropTypes.func.isRequired,
    onTabSwitch: PropTypes.func.isRequired,
};

TabContent.defaultProps = {
    currentRoute: 'balance',
};

export default connect(mapStateToProps, mapDispatchToProps)(TabContent);
