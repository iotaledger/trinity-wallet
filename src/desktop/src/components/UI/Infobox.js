import React from 'react';
import PropTypes from 'prop-types';
import css from './Infobox.css';

export default class Infobox extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node.isRequired,
    };

    render() {
        const { children } = this.props;

        return <div className={css.wrapper}>{children}</div>;
    }
}
