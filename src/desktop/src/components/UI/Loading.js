import React from 'react';
import PropTypes from 'prop-types';
import Logo from 'components/UI/Logo';
import classNames from 'classnames';
import css from './Loading.css';

export default class Loading extends React.PureComponent {
    static propTypes = {
        loop: PropTypes.bool,
    };

    render() {
        const { loop } = this.props;

        return (
            <div className={css.loading}>
                <Logo width={168} className={classNames('animated', loop && 'loop')} />
            </div>
        );
    }
}
