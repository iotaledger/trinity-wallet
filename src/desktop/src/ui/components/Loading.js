import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Logo from 'ui/components/Logo';
import css from './Loading.css';

/**
 * Loading screen component
 */
export default class Loading extends React.PureComponent {
    static propTypes = {
        /** Loading animation loop option */
        loop: PropTypes.bool,
        /** Loading inline class state */
        inline: PropTypes.bool,
        /** Loading screen title content */
        title: PropTypes.string,
        /** Loading screen subtitle content */
        subtitle: PropTypes.string,
        /** On animation end  event */
        onEnd: PropTypes.func,
    };

    render() {
        const { loop, inline, title, subtitle, onEnd } = this.props;

        return (
            <div className={classNames(css.loading, inline ? css.inline : null)}>
                <div>
                    <Logo size={200} animate loop={loop} onEnd={onEnd} />
                    {title && <h1>{title}</h1>}
                    {subtitle && <h2>{subtitle}</h2>}
                </div>
            </div>
        );
    }
}
