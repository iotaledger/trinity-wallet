import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import css from './Steps.css';

export default class Steps extends React.PureComponent {
    render() {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: '10px',
                    justifyContent: 'center',
                }}
            >
                <span>Manual Copy</span>
                <div
                    style={{ borderBottom: '1px solid gray', width: '150px', marginRight: '20px', marginLeft: '20px' }}
                />
                <span>Paper Wallet</span>
                <div
                    style={{ borderBottom: '1px solid gray', width: '150px', marginRight: '20px', marginLeft: '20px' }}
                />
                <span>Copy to clipboard</span>
            </div>
        );
    }
}
