import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import css from './colors.scss';

class Colors extends React.PureComponent {
    static propTypes = {
        theme: PropTypes.object.isRequired,
    };

    render() {
        return (
            <div className={css.colors}>
                <h1>Colors</h1>

                <div>
                    <div className={css.bodyColor} />
                    <strong>
                        body.color <br />
                        {this.props.theme.body.color}
                    </strong>
                    <span>Default text, border and icon fill color</span>
                </div>
                <div>
                    <div className={css.bodyBg} />
                    <strong>
                        body.bg <br />
                        {this.props.theme.body.bg}
                    </strong>
                    <span>Default interface background</span>
                </div>
                <div>
                    <div className={css.bodyAlt} />
                    <strong>
                        body.alt <br />
                        {this.props.theme.body.alt}
                    </strong>
                    <span>
                        Default alternative text, border and icon color.
                        <em>E.g. Dashboard disabled menu items, content dividers</em>
                    </span>
                </div>
                <div>
                    <div className={css.bodyAltBg} />
                    <strong>
                        body.altBg <br />
                        {this.props.theme.body.altBg}
                    </strong>
                    <span>
                        Alternative background color. <em>E.g. Dashboard card background</em>
                    </span>
                </div>
                <hr />

                <div>
                    <div className={css.barColor} />
                    <strong>
                        bar.color <br />
                        {this.props.theme.bar.color}
                    </strong>
                    <span>Sidebar and mobile menu text, border and icon fill color</span>
                </div>
                <div>
                    <div className={css.barBg} />
                    <strong>
                        bar.bg <br />
                        {this.props.theme.bar.bg}
                    </strong>
                    <span>Sidebar and mobile menu background</span>
                </div>
                <div>
                    <div className={css.barAlt} />
                    <strong>
                        bar.alt <br />
                        {this.props.theme.bar.alt}
                    </strong>
                    <span>
                        Sidebar and mobile menu alternative color. <em>E.g. Active item background color</em>
                    </span>
                </div>
                <hr />

                <div>
                    <div className={css.primaryColor} />
                    <strong>
                        primary.color <br />
                        {this.props.theme.primary.color}
                    </strong>
                    <span>Primary CTA and accent color</span>
                </div>
                <div>
                    <div className={css.primaryHover} />
                    <strong>
                        primary.hover <br />
                        {this.props.theme.primary.hover}
                    </strong>
                    <span>Primary color hover state</span>
                </div>
                <div>
                    <div className={css.primaryBody} />
                    <strong>
                        primary.body <br />
                        {this.props.theme.primary.body}
                    </strong>
                    <span>Text color if primary.color used as background</span>
                </div>
                <hr />

                <div>
                    <div className={css.secondaryColor} />
                    <strong>
                        secondary.color <br />
                        {this.props.theme.secondary.color}
                    </strong>
                    <span>Secondary CTA and accent color</span>
                </div>
                <div>
                    <div className={css.secondaryHover} />
                    <strong>
                        secondary.hover <br />
                        {this.props.theme.secondary.hover}
                    </strong>
                    <span>Secondary color hover state</span>
                </div>
                <div>
                    <div className={css.secondaryBody} />
                    <strong>
                        secondary.body <br />
                        {this.props.theme.secondary.body}
                    </strong>
                    <span>Text color if secondary.color used as background</span>
                </div>
                <hr />

                <div>
                    <div className={css.darkColor} />
                    <strong>
                        dark.color <br />
                        {this.props.theme.dark.color}
                    </strong>
                    <span>
                        Dark CTA and accent color <em>E.g. onboarding Back buttons</em>
                    </span>
                </div>
                <div>
                    <div className={css.darkHover} />
                    <strong>
                        dark.hover <br />
                        {this.props.theme.dark.hover}
                    </strong>
                    <span>Dark color hover state</span>
                </div>
                <div>
                    <div className={css.darkBody} />
                    <strong>
                        dark.body <br />
                        {this.props.theme.dark.body}
                    </strong>
                    <span>Text color if dark.color used as background</span>
                </div>
                <hr />

                <div>
                    <div className={css.extraColor} />
                    <strong>
                        extra.color <br />
                        {this.props.theme.extra.color}
                    </strong>
                    <span>
                        Extra CTA and accent color <em>E.g. mobile {'Save your seed'} option buttons</em>
                    </span>
                </div>
                <div>
                    <div className={css.extraHover} />
                    <strong>
                        extra.hover <br />
                        {this.props.theme.extra.hover}
                    </strong>
                    <span>Extra color hover state</span>
                </div>
                <div>
                    <div className={css.extraBody} />
                    <strong>
                        extra.body <br />
                        {this.props.theme.extra.body}
                    </strong>
                    <span>Text color if extra.color used as background</span>
                </div>
                <hr />

                <div>
                    <div className={css.positiveColor} />
                    <strong>
                        positive.color <br />
                        {this.props.theme.positive.color}
                    </strong>
                    <span>
                        Positive, success state color <em>E.g. Success notification background</em>
                    </span>
                </div>
                <div>
                    <div className={css.positiveHover} />
                    <strong>
                        positive.hover <br />
                        {this.props.theme.positive.hover}
                    </strong>
                    <span>Positive color hover state</span>
                </div>
                <div>
                    <div className={css.positiveBody} />
                    <strong>
                        positive.body <br />
                        {this.props.theme.positive.body}
                    </strong>
                    <span>Text color if positive.color used as background</span>
                </div>
                <hr />

                <div>
                    <div className={css.negativeColor} />
                    <strong>
                        negative.color <br />
                        {this.props.theme.negative.color}
                    </strong>
                    <span>
                        Negative CTA and accent color <em>E.g. Failure notification, deletion button</em>
                    </span>
                </div>
                <div>
                    <div className={css.negativeHover} />
                    <strong>
                        negative.hover <br />
                        {this.props.theme.negative.hover}
                    </strong>
                    <span>Negative color hover state</span>
                </div>
                <div>
                    <div className={css.negativeBody} />
                    <strong>
                        negative.body <br />
                        {this.props.theme.negative.body}
                    </strong>
                    <span>Text color if negative.color used as background</span>
                </div>
                <hr />

                <div>
                    <div className={css.inputColor} />
                    <strong>
                        input.color<br />
                        {this.props.theme.input.color}
                    </strong>
                    <span>Input element text color</span>
                </div>
                <div>
                    <div className={css.inputBg} />
                    <strong>
                        input.bg<br />
                        {this.props.theme.input.bg}
                    </strong>
                    <span>Input element background color</span>
                </div>
                <div>
                    <div className={css.inputAlt} />
                    <strong>
                        input.alt<br />
                        {this.props.theme.input.alt}
                    </strong>
                    <span>
                        Input element alternative color. <em>E.g. Action icons inside an input</em>
                    </span>
                </div>
                <hr />

                <div>
                    <div className={css.labelColor} />
                    <strong>
                        label.color<br />
                        {this.props.theme.label.color}
                    </strong>
                    <span>Form label color</span>
                </div>
                <div>
                    <div className={css.labelHover} />
                    <strong>
                        label.hover<br />
                        {this.props.theme.label.hover}
                    </strong>
                    <span>Form label hover/active state color</span>
                </div>
                <hr />

                <div>
                    <div className={css.chartColor} />
                    <strong>
                        chart.color<br />
                        {this.props.theme.chart.color}
                    </strong>
                    <span>Chart line color</span>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default connect(mapStateToProps)(Colors);
