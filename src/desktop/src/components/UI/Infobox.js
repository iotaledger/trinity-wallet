import React from 'react';
import PropTypes from 'prop-types';
import css from './Infobox.css';

export default class Infobox extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node,
    };

    render() {
        const { children } = this.props;

        return (
            <div className={css.wrapper}>
                <span className={css.icon} />
                {children}
            </div>
        );
    }
}
