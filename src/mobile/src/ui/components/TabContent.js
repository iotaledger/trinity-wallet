import last from 'lodash/last';
import React, { PureComponent } from 'react';
import timer from 'react-native-timer';
import PropTypes from 'prop-types';
import AnimatedComponent from 'ui/components/AnimatedComponent';
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
    constructor(props) {
        super(props);
        this.state = {
            nextRoute: props.currentRoute,
        };
        // Resets animation in case home screen remounts and is not last in the nav stack e.g. after Biometric auth request
        if (last(props.navStack) !== 'home') {
            this.animationOutType = ['slideOutLeftSmall', 'fadeOut'];
            this.animationInType = ['slideInLeftSmall', 'fadeIn'];
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.currentRoute !== newProps.currentRoute) {
            this.animationOutType = this.getAnimation(this.props.currentRoute, newProps.currentRoute, false);
            this.animationInType = this.getAnimation(this.props.currentRoute, newProps.currentRoute);
            timer.setTimeout(
                'delayRouteChange' + newProps.currentRoute,
                () => this.setState({ nextRoute: newProps.currentRoute }),
                150,
            );
        }

        if (this.props.inactive && newProps.inactive) {
            this.animationInType = ['fadeIn'];
        }

        // Adjusts animation direction when pushing to nav stack from settings
        if (this.props.navStack.length !== newProps.navStack.length) {
            this.animationOutType = ['slideOutLeftSmall', 'fadeOut'];
            this.animationInType = ['slideInLeftSmall', 'fadeIn'];
        }

        // Fade out on log out
        if (newProps.navStack.length === 1) {
            this.animationOutType = ['fadeOut'];
        }
    }

    componentWillUnmount() {
        timer.clearTimeout('delaySettingChange' + this.props.currentRoute);
    }

    /**
     * Gets settings animation according to current and next home route
     *
     * @param {string} currentHomeRoute
     * @param {string} nextHomeRoute
     * @param {bool} animationIn
     * @returns {object}
     */
    getAnimation(currentHomeRoute, nextHomeRoute, animationIn = true) {
        const routes = ['balance', 'send', 'receive', 'history', 'settings'];
        if (routes.indexOf(currentHomeRoute) < routes.indexOf(nextHomeRoute)) {
            if (animationIn) {
                return ['slideInRightSmall', 'fadeIn'];
            }
            return ['slideOutLeftSmall', 'fadeOut'];
        } else if (routes.indexOf(currentHomeRoute) > routes.indexOf(nextHomeRoute)) {
            if (animationIn) {
                return ['slideInLeftSmall', 'fadeIn'];
            }
            return ['slideOutRightSmall', 'fadeOut'];
        }
    }

    render() {
        const { isKeyboardActive } = this.props;
        const { nextRoute } = this.state;
        const Content = routeToComponent[nextRoute];

        return (
            <AnimatedComponent
                animationInType={this.animationInType}
                animationOutType={this.animationOutType}
                animateInTrigger={this.state.nextRoute}
                animateOutTrigger={this.props.currentRoute}
                duration={150}
                style={{ flex: 1 }}
                screenName="home"
            >
                <Content
                    type={nextRoute}
                    closeTopBar={() => this.props.handleCloseTopBar()}
                    isKeyboardActive={isKeyboardActive}
                    onTabSwitch={(name) => this.props.onTabSwitch(name)}
                />
            </AnimatedComponent>
        );
    }
}

const mapStateToProps = (state) => ({
    currentRoute: state.home.childRoute,
    inactive: state.ui.inactive,
    isKeyboardActive: state.ui.isKeyboardActive,
    navStack: state.wallet.navStack,
});

TabContent.propTypes = {
    /** @ignore */
    currentRoute: PropTypes.oneOf(Object.keys(routeToComponent)),
    /** onTabSwitch callback function
     * @param {string} name - Next route name
     */
    onTabSwitch: PropTypes.func.isRequired,
    /** Closes topBar */
    handleCloseTopBar: PropTypes.func.isRequired,
    /** @ignore */

    isKeyboardActive: PropTypes.bool.isRequired,
    /** @ignore */
    inactive: PropTypes.bool.isRequired,
    /** @ignore */
    navStack: PropTypes.array.isRequired,
};

TabContent.defaultProps = {
    currentRoute: 'balance',
};

export default connect(mapStateToProps, null)(TabContent);
