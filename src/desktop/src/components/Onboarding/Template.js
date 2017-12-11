// @flow
import React from 'react';
import PropTypes from 'prop-types';
// import Header from './Header';
import Logo from '../UI/Logo';

export const Main = ({ children }) =>
    children && (
        <main>
            <div>{children}</div>
        </main>
    );
export const Footer = ({ children }) => children && <footer>{children}</footer>;

export default class Template extends React.Component {
    static propTypes = {
        bodyClass: PropTypes.string,
        children: PropTypes.node.isRequired,
        headline: PropTypes.string,
        type: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
    };

    static Main = Main;
    static Footer = Footer;

    componentWillMount() {
        const { bodyClass } = this.props;
        if (bodyClass) {
            document.body.classList.add(bodyClass);
        }
    }

    componentWillUnmount() {
        const { bodyClass } = this.props;
        if (bodyClass) {
            document.body.classList.remove(bodyClass);
        }
    }

    render() {
        const { children, headline, type: Type = 'div', ...props } = this.props;
        delete props.bodyClass;
        return (
            <Type {...props}>
                <header>
                    <Logo width={72} className="static" />
                    {headline && <h1>{headline}</h1>}
                </header>
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
