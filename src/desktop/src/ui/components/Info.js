import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'ui/components/Icon';
import css from './info.css';

/**
 * Info block component
 */
export default class Info extends React.PureComponent {
    static propTypes = {
        /** Info block content */
        children: PropTypes.node.isRequired,
    };

    render() {
        const { children } = this.props;

        return (
            <div className={css.wrapper}>
                <Icon icon="info" size={30} />
                {children}
            </div>
        );
    }
}
