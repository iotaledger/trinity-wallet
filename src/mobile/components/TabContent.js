import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';
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
    render() {
        const { currentRoute, navigator, isKeyboardActive } = this.props;
        const Content = routeToComponent[currentRoute];

        return (
            <View style={{ flex: 1 }}>
                <Content
                    type={currentRoute}
                    navigator={navigator}
                    closeTopBar={() => this.props.handleCloseTopBar()}
                    isKeyboardActive={isKeyboardActive}
                    onTabSwitch={(name) => this.props.onTabSwitch(name)}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    currentRoute: state.home.childRoute,
});

TabContent.propTypes = {
    /** Navigation object */
    navigator: PropTypes.object.isRequired,
    /** Currently selected home screen route */
    currentRoute: PropTypes.oneOf(Object.keys(routeToComponent)),
    /** onTabSwitch callback function
     * @param {string} name - Next route name
     */
    onTabSwitch: PropTypes.func.isRequired,
    handleCloseTopBar: PropTypes.func.isRequired,
    /** Determines whether keyboard is open on iOS */
    isKeyboardActive: PropTypes.bool.isRequired,
};

TabContent.defaultProps = {
    currentRoute: 'balance',
};

export default connect(mapStateToProps, null)(TabContent);
