import React from 'react';
import PropTypes from 'prop-types';
import './App.css';

class Hello extends React.PureComponent {

    static propTypes = {
        name: PropTypes.string,
    };

    render() {
        return (
            <h1>Hello, {this.props.name}!</h1>
        );
    }

}

export default Hello;
