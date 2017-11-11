import React from 'react';
import PropTypes from 'prop-types';
import NavLink from '../../UI/NavLink';

// import css from '../../Layout/Main.css';

export default class Link extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        image: PropTypes.string,
        label: PropTypes.string,
        to: PropTypes.string,
    };

    render() {
        const { children, image, to, ...props } = this.props;
        return (
            <NavLink to={to} {...props}>
                {image && <img src={image} />}
                {children}
            </NavLink>
        );
    }
}
