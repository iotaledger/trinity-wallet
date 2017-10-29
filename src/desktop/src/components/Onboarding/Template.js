// @flow
import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';

export const Main = ({ children }) =>
    children && (
        <main>
            <div>{children}</div>
        </main>
    );
export const Footer = ({ children }) => children && <footer>{children}</footer>;

export default class Template extends React.Component {
    static propTypes = {
        headline: PropTypes.string,
        children: PropTypes.node.isRequired,
        type: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
    };

    static Main = Main;
    static Footer = Footer;

    render() {
        const { children, headline, type: Type = 'div', ...props } = this.props;
        return (
            <Type {...props}>
                <Header headline={headline} />
                {React.Children.map(children, child => {
                    if (child.type === Main) {
                        return child;
                    }
                })}
                {React.Children.map(children, child => {
                    if (child.type === Footer) {
                        return child;
                    }
                })}
            </Type>
        );
    }
}
