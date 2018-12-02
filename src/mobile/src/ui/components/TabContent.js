import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { connect } from 'react-redux';
import BalanceComponent from 'ui/views/wallet/Balance';
import SendComponent from 'ui/views/wallet/Send';
import Receive from 'ui/views/wallet/Receive';
import History from 'ui/views/wallet/History';
import Settings from 'ui/views/wallet/Settings';

const routeToComponent = {
    balance: BalanceComponent,
    send: SendComponent,
    receive: Receive,
    history: History,
    settings: Settings,
};

class TabContent extends PureComponent {
    render() {
        const { currentRoute, isKeyboardActive } = this.props;
        const Content = routeToComponent[currentRoute];

        return (
            <View style={{ flex: 1 }}>
                <Content
                    type={currentRoute}
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
