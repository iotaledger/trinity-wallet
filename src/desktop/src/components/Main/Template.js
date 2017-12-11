// @flow
import React from 'react';
import PropTypes from 'prop-types';
// import Header from './Header';
import Header from './Header';
import Sidebar from './Sidebar';
import css from '../Layout/Main.css';

export const Content = ({ children }) =>
    children && (
        <div className={css.content}>
            <div className={css.inner}>{children}</div>
        </div>
    );

export const Footer = ({ children }) => children && <footer>{children}</footer>;

// export const Sidebar = ({ children }) => children && <section>{children}</section>;

export default class Template extends React.Component {
    static propTypes = {
        bodyClass: PropTypes.string,
        children: PropTypes.node.isRequired,
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
        const { children } = this.props;
        // delete props.bodyClass;
        return (
            <section className={css.wrapper}>
                <Header />
                <main>
                    <Sidebar />
                    {React.Children.map(children, child => {
                        if (child.type === Content) {
                            return child;
                        }
                    })}
                </main>
            </section>
        );
    }
}
