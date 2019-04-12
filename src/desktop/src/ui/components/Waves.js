import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getThemeFromState } from 'selectors/global';

import css from './waves.scss';

/**
 * Onboarding waves background component
 */
class Waves extends PureComponent {
    static propTypes = {
        /** Wave visual offset */
        offset: PropTypes.number,
        /** Height of the waves */
        height: PropTypes.string,
        /** Bottom margin of the waves */
        bottom: PropTypes.string,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    /**
     * Create wave background image
     * @param {boolean} isPrimary - should create primary or secondary wave
     */
    getWave(isPrimary) {
        const fill = isPrimary ? this.props.theme.wave.primary : this.props.theme.wave.secondary;
        const wave = `<svg width='3196px' height='227px' viewBox='0 0 3196 227' xmlns='http://www.w3.org/2000/svg'><path fill='${fill}' d='M-1.13686838e-13,227 L-1.13686838e-13,149.222136 C289,149.222136 382,49 782,49 C1182.25708,48.7480077 1288.582,148.706694 1598.03248,149.220507 C1885.47122,148.649282 1979.93914,1.73038667e-16 2379,1.73038667e-16 C2780.102,-0.252524268 2885,149.222526 3195.995,149.222526 C3195.995,178.515341 3196,227 3196,227 L1596,227 L-1.13686838e-13,227 Z'></path></svg>`;
        return `url("data:image/svg+xml;utf8,${wave}")`;
    }

    render() {
        const { offset, bottom, height } = this.props;

        return (
            <div className={css.wave} style={{ height: height ? height : '160px', bottom: bottom ? bottom : '0px' }}>
                <div
                    style={{
                        backgroundImage: this.getWave(),
                        backgroundPosition: `${offset ? offset + 50 : 50}% bottom`,
                    }}
                />
                <div
                    style={{
                        backgroundImage: this.getWave(true),
                        backgroundPosition: `${offset ? offset : 0}% bottom`,
                    }}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

export default connect(mapStateToProps)(Waves);
