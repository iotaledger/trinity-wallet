import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import lottie from 'lottie-web';

/**
 * lottie-web wrapper
 */
const Lottie = ({ data, height, loop, paused, segments, width, onEnd }) => {
    const container = useRef(null);
    const [animation, setAnimation] = useState(null);

    useEffect(
        () => {
            if (!animation) {
                return;
            }
            if (paused) {
                animation.stop();
            } else {
                animation.play();
            }
        },
        [paused],
    );

    useEffect(() => {
        const options = {
            container: container.current,
            renderer: 'svg',
            animationData: data,
            loop: loop || false,
            autoplay: !paused,
        };
        const _animation = lottie.loadAnimation(options);

        if (segments) {
            _animation.playSegments(segments);
        }

        if (typeof onEnd === 'function') {
            _animation.addEventListener('complete', onEnd);
        }

        setAnimation(_animation);

        return () => {
            _animation.destroy();
        };
    }, []);

    const style = {
        width: `${width}px`,
        height: `${height}px`,
        overflow: 'hidden',
        margin: '0 auto',
        outline: 'none',
    };

    return <div ref={container} style={style} />;
};

Lottie.propTypes = {
    /** Animation data */
    data: PropTypes.object.isRequired,
    /** Animation height */
    height: PropTypes.number.isRequired,
    /** Should animation be looped */
    loop: PropTypes.bool,
    /** Animation end callback */
    onEnd: PropTypes.func,
    /** Is animation paused */
    paused: PropTypes.bool,
    /** Animation width */
    width: PropTypes.number.isRequired,
    /* Animation segment played after first loop */
    segments: PropTypes.array,
};

export default Lottie;
