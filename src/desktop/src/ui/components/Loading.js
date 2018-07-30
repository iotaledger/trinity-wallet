import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Logo from 'ui/components/Logo';
import css from './Loading.scss';

/**
 * Loading screen component
 */
export default class Loading extends React.PureComponent {
    static propTypes = {
        /** Should animation loop */
        loop: PropTypes.bool,
        /** Should component have inline class */
        inline: PropTypes.bool,
        /** Should component have transparent class */
        transparent: PropTypes.bool,
        /** Loading screen title content */
        title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        /** Loading screen subtitle content */
        subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        /** On animation end event callback */
        onEnd: PropTypes.func,
    };

    render() {
        const { loop, inline, transparent, title, subtitle, onEnd } = this.props;

        return (
            <div className={classNames(css.loading, inline ? css.inline : null, transparent ? css.transparent : null)}>
                <div>
                    <Logo size={200} animate loop={loop} onEnd={onEnd} />
                    {title && <h1>{title}</h1>}
                    {subtitle && <h2>{subtitle}</h2>}
                </div>
            </div>
        );
    }
}
