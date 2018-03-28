import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { toggleTopBarDisplay } from 'iota-wallet-shared-modules/actions/home';
import BalanceComponent from '../containers/balance';
import SendComponent from '../containers/send';
import Receive from '../containers/receive';
import History from '../containers/history';
import Settings from '../containers/settings';

const routeToComponent = {
    balance: BalanceComponent,
    send: SendComponent,
    receive: Receive,
    history: History,
    settings: Settings,
};

class TabContent extends Component {
    render() {
        const { currentRoute, navigator } = this.props;
        const Content = routeToComponent[currentRoute];

        return (
            <View style={{ flex: 1 }}>
                <Content
                    type={currentRoute}
                    navigator={navigator}
                    closeTopBar={() => this.props.handleCloseTopBar()}
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
    handleCloseTopBar: PropTypes.func.isRequired,
};

TabContent.defaultProps = {
    currentRoute: 'balance',
};

export default connect(mapStateToProps, mapDispatchToProps)(TabContent);
