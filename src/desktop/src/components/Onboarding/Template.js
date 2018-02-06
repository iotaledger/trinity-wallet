import React from 'react';
import PropTypes from 'prop-types';
import Logo from 'ui/components/Logo';

export const Content = ({ children }) =>
    children && (
        <main>
            <div>{children}</div>
        </main>
    );
export const Footer = ({ className, children }) => children && <footer className={className}>{children}</footer>;

export default class Template extends React.Component {
    static propTypes = {
        bodyClass: PropTypes.string,
        children: PropTypes.node.isRequired,
        // TODO: rename headline to title
        headline: PropTypes.string,
        type: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
    };

    static Content = Content;
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
                    <Logo size={72} />
                    {headline && <h1>{headline}</h1>}
                </header>
                {React.Children.map(children, (child) => {
                    if (child.type === Content) {
                        return child;
                    }
                })}
                {React.Children.map(children, (child) => {
                    if (child.type === Footer) {
                        return child;
                    }
                })}
            </Type>
        );
    }
}
