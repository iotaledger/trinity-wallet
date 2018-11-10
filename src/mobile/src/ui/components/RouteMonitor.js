import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Navigation } from 'react-native-navigation';
import { setRoute } from 'shared-modules/actions/ui';
import { connect } from 'react-redux';

export default function RouteMonitor(C) {
    class EnhancedComponent extends Component {
        static propTypes = {
            /** @ignore */
            setRoute: PropTypes.func.isRequired,
        };

        componentWillMount() {
            Navigation.events().registerComponentDidAppearListener((componentId) => {
                if (componentId.componentName) {
                    this.props.setRoute(componentId.componentName);
                }
            });
        }

        render() {
            return <C {...this.props} />;
        }
    }

    const mapDispatchToProps = {
        setRoute,
    };

    return connect(null, mapDispatchToProps)(EnhancedComponent);
}
