import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'ui/components/Icon';
import css from './info.scss';

/**
 * Info block component
 */
export default class Info extends React.PureComponent {
    static propTypes = {
        /** Info block content */
        children: PropTypes.node.isRequired,
        /** Determines whether to display icon */
        displayIcon: PropTypes.bool,
    };

    static defaultProps = {
        displayIcon: true,
    };

    render() {
        const { children, displayIcon } = this.props;

        return (
            <div className={css.wrapper}>
                {displayIcon && <Icon icon="info" size={28} />}
                {children}
            </div>
        );
    }
}
