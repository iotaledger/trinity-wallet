// @flow
import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';

export const Main = ({ children }) => children && <main>{children}</main>;
export const Footer = ({ children }) => children && <footer>{children}</footer>;

export default class Template extends React.Component {
    static propTypes = {
        headline: PropTypes.string,
        children: PropTypes.node.isRequired,
    };

    static Main = Main;
    static Footer = Footer;

    render() {
        const { children, headline } = this.props;
        return (
            <div>
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
            </div>
        );
    }
}
