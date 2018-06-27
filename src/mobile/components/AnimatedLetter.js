import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';
import timer from 'react-native-timer';

export class AnimatedLetter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scramblingLetter: this.getRandomChar(),
        };
    }

    /* componentWillReceiveProps(newProps) {
        if (!this.props.scramble && newProps.scramble) {
            this.setLetterScramble();
        }
        if (this.props.scramble && !newProps.scramble) {
            timer.clearTimeout('scramble' + this.props.index);
        }

    } */

    getRandomChar() {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
        return charset.charAt(Math.floor(Math.random() * 27));
    }

    setLetterScramble() {
        timer.setInterval(
            'scramble' + this.props.index,
            () => {
                this.setState({ scramblingLetter: this.getRandomChar() });
            },
            Math.floor(Math.random() * 70) + 10,
        );
    }

    render() {
        const { textStyle, children } = this.props;
        const { scramblingLetter } = this.state;
        /* FIXME: Disable scramble temporarily */
        const scramble = false;
        return <Animated.Text style={textStyle}>{scramble ? scramblingLetter : children}</Animated.Text>;
    }
}

AnimatedLetter.propTypes = {
    /** Letter text styles */
    textStyle: PropTypes.array,
    /** Children content */
    children: PropTypes.string,
    /** Current letter index */
    index: PropTypes.number,
};

export default AnimatedLetter;
