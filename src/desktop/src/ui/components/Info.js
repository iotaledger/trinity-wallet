import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'ui/components/Icon';
import css from './info.css';

export default class Info extends React.PureComponent {
    static propTypes = {
        children: PropTypes.node.isRequired,
    };

    render() {
        const { children } = this.props;

        return (
            <div className={css.wrapper}>
                <Icon icon="info" size={30}/>
                {children}
            </div>
        );
    }
}
