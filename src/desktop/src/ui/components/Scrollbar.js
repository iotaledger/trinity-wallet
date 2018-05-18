import React from 'react';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'perfect-scrollbar';

import css from './scrollbar.scss';

/**
 * Inner scrollbar container componten
 */
class Scrollbar extends React.PureComponent {
    static propTypes = {
        /* Container reach scroll end callback */
        onScrollEnd: PropTypes.func,
        /* Scollbar container content */
        children: PropTypes.any.isRequired,
    };

    componentDidMount() {
        this.Ps = new PerfectScrollbar(this.container, { suppressScrollX: true });
        if (this.props.onScrollEnd) {
            this.container.addEventListener('ps-y-reach-end', this.props.onScrollEnd, false);
        }
    }

    componentDidUpdate() {
        const self = this;
        setTimeout(() => {
            self.Ps.update(self.refs.container);
        }, 100);
    }

    componentWillUnmount() {
        this.Ps.destroy();
        this.container.removeEventListener('ps-y-reach-end', this.props.onScrollEnd, false);
    }

    render() {
        return (
            <div
                ref={(container) => {
                    this.container = container;
                }}
                className={css.scrollbar}
            >
                {this.props.children}
            </div>
        );
    }
}

export default Scrollbar;
