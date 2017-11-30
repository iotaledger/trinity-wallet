import React from 'react';
import PropTypes from 'prop-types';
import LogoGlow from '../../../../shared/images/iota-glow.png';

export default class Logo extends React.PureComponent {
    static propTypes = {
        width: PropTypes.number,
    };

    render() {
        const { width } = this.props;
        return (
            // <span className={logo} width={width} />
            <img src={LogoGlow} width={width} />
        );
    }
}
