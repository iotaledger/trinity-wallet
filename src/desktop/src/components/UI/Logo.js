import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './Logo.css';

export default class Logo extends React.PureComponent {
    static propTypes = {
        width: PropTypes.number,
        className: PropTypes.string,
    };

    render() {
        const { width, className } = this.props;
        const svg = (
            <svg width={width} height={width} viewBox="0 0 336 336" xmlns="http://www.w3.org/2000/svg">
                {' '}
                <g className="level-1">
                    {' '}
                    <g>
                        {' '}
                        <circle className="l" cx="18" cy="170" r="18" />{' '}
                        <circle className="m" cx="43" cy="104" r="15" /> <circle className="s" cx="77" cy="52" r="13" />{' '}
                        <circle className="l" cx="249" cy="18" r="18" />{' '}
                        <circle className="m" cx="294" cy="72" r="15" />{' '}
                        <circle className="s" cx="323" cy="128" r="13" />{' '}
                        <circle className="l" cx="259" cy="309" r="18" />{' '}
                        <circle className="m" cx="190" cy="321" r="15" />{' '}
                        <circle className="s" cx="128" cy="317" r="13" />{' '}
                    </g>{' '}
                </g>{' '}
                <g className="level-2" transform="translate(44, 35)">
                    {' '}
                    <g>
                        {' '}
                        <circle className="l" cx="15" cy="106" r="15" /> <circle className="m" cx="39" cy="53" r="13" />{' '}
                        <circle className="s" cx="69" cy="11" r="11" /> <circle className="l" cx="210" cy="32" r="15" />{' '}
                        <circle className="m" cx="244" cy="80" r="13" />{' '}
                        <circle className="s" cx="265" cy="127" r="11" />{' '}
                        <circle className="l" cx="170" cy="253" r="15" />{' '}
                        <circle className="m" cx="112" cy="260" r="13" />{' '}
                        <circle className="s" cx="61" cy="254" r="11" />{' '}
                    </g>{' '}
                </g>{' '}
                <g className="level-3" transform="translate(81, 38)">
                    {' '}
                    <g>
                        {' '}
                        <circle className="l" cx="18" cy="87" r="13" /> <circle className="m" cx="38" cy="44" r="11" />{' '}
                        <circle className="s" cx="63" cy="10" r="10" /> <circle className="l" cx="167" cy="72" r="13" />{' '}
                        <circle className="m" cx="194" cy="111" r="11" />{' '}
                        <circle className="s" cx="211" cy="150" r="10" />{' '}
                        <circle className="l" cx="99" cy="224" r="13" />{' '}
                        <circle className="m" cx="52" cy="228" r="11" />{' '}
                        <circle className="s" cx="10" cy="223" r="10" />{' '}
                    </g>{' '}
                </g>{' '}
                <g className="level-4" transform="translate(76, 47)">
                    {' '}
                    <g>
                        {' '}
                        <circle className="l" cx="59" cy="72" r="11" /> <circle className="m" cx="74" cy="36" r="10" />{' '}
                        <circle className="s" cx="93" cy="8" r="8" /> <circle className="l" cx="159" cy="97" r="11" />{' '}
                        <circle className="m" cx="182" cy="128" r="10" />{' '}
                        <circle className="s" cx="197" cy="159" r="8" />{' '}
                        <circle className="l" cx="81" cy="187" r="11" />{' '}
                        <circle className="m" cx="43" cy="192" r="10" /> <circle className="s" cx="8" cy="189" r="8" />{' '}
                    </g>{' '}
                </g>{' '}
                <g className="level-5" transform="translate(75, 58)">
                    {' '}
                    <g>
                        {' '}
                        <circle className="l" cx="91" cy="63" r="10" /> <circle className="m" cx="100" cy="32" r="8" />{' '}
                        <circle className="s" cx="114" cy="8" r="8" /> <circle className="l" cx="143" cy="112" r="10" />{' '}
                        <circle className="m" cx="165" cy="135" r="8" />{' '}
                        <circle className="s" cx="179" cy="160" r="8" />{' '}
                        <circle className="l" cx="68" cy="148" r="10" /> <circle className="m" cx="37" cy="155" r="8" />{' '}
                        <circle className="s" cx="8" cy="155" r="8" />{' '}
                    </g>{' '}
                </g>{' '}
                <g className="level-6" transform="translate(81, 72)">
                    {' '}
                    <g>
                        {' '}
                        <circle className="l" cx="110" cy="56" r="8" /> <circle className="m" cx="114" cy="29" r="8" />{' '}
                        <circle className="s" cx="122" cy="6" r="6" /> <circle className="l" cx="118" cy="116" r="8" />{' '}
                        <circle className="m" cx="139" cy="133" r="8" />{' '}
                        <circle className="s" cx="156" cy="152" r="6" /> <circle className="l" cx="55" cy="109" r="8" />{' '}
                        <circle className="m" cx="30" cy="119" r="8" /> <circle className="s" cx="6" cy="124" r="6" />{' '}
                    </g>{' '}
                </g>
            </svg>
        );

        let classes = [css.logo];
        if (className) {
            classes = classes.concat(className.split(' ').map(name => css[name]));
        }

        return (
            <div className={classNames(classes)} style={{ width: width, height: width }}>
                {svg}
                {svg}
            </div>
        );
    }
}
