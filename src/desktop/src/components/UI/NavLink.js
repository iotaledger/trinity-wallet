import React from 'react';
// import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

export default class CustomNavLink extends React.PureComponent {
    render() {
        return <NavLink activeClassName="nav-active" {...this.props} />;
    }
}
