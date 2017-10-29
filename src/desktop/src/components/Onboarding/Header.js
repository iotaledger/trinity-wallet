import React from 'react';
import PropTypes from 'prop-types';
import Logo from '../UI/Logo';

export default class Header extends React.PureComponent {
    static propTypes = {
        headline: PropTypes.string,
    };

    render() {
        const { headline } = this.props;
        return (
            <header>
                <Logo width={72} />
                {headline && <h1>{headline}</h1>}
            </header>
        );
    }
}
