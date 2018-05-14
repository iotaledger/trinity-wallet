import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { updateTheme } from 'actions/settings';
import { generateAlert } from 'actions/alerts';

import css from './colors.scss';

const colorTitles = {
    'body.color': 'Default text, border and icon fill color',
    'body.bg': 'Default interface background',
    'body.alt': 'Default alternative text, border and icon color.',
    'bar.color': 'Sidebar and mobile menu text, border and icon fill color',
    'bar.bg': 'Sidebar and mobile menu background',
    'bar.alt': ' Sidebar and mobile menu alternative color.',
    'primary.color': 'Primary CTA and accent color',
    'primary.hover': 'Primary color hover state',
    'primary.body': 'Text color if primary.color used as background',
    'secondary.color': 'Secondary CTA and accent color',
    'secondary.hover': 'Secondary color hover state',
    'secondary.body': 'Text color if secondary.color used as background',
    'dark.color': 'Dark CTA and accent color',
    'dark.hover': 'Dark color hover state',
    'dark.body': 'Text color if dark.color used as background',
    'extra.color': 'Extra CTA and accent color',
    'extra.hover': 'Extra color hover state',
    'extra.body': 'Text color if extra.color used as background',
    'positive.color': 'Positive CTA and accent color',
    'positive.hover': 'Positive color hover state',
    'positive.body': 'Text color if positive.color used as background',
    'negative.color': 'Negative CTA and accent color',
    'negative.hover': 'Negative color hover state',
    'negative.body': 'Text color if negative.color used as background',
    'input.color': 'Input element text color',
    'input.bg': 'Input element background color',
    'input.alt': 'Input element alternative color',
    'input.border': 'Input element border color',
    'input.hover': 'Input element focus state border color',
    'label.color': 'Input element label color',
    'label.hover': 'Input element focus state label color',
    'chart.color': 'Chart line fill color',
    'wave.primary': 'Wave background fill color',
    'wave.secondary': 'Wave background fill color',
    'box.bg': 'Box element background color',
    'box.alt': 'Box element accent color',
    'box.body': 'Text color if box.bg used as background color',
};

const colorExamples = {
    'body.alt': 'Dashboard dividers, chart subtitles, content scrollbars',
    'bar.alt': 'Active item background color',
    'positive.color': 'Success notification background',
    'negative.color': 'Error notification background',
    'input.alt': 'Action iconfill color inside input fields',
};

class Colors extends React.Component {
    static propTypes = {
        theme: PropTypes.object.isRequired,
        themeName: PropTypes.string.isRequired,
        updateTheme: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            theme: this.props.theme,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.themeName !== nextProps.themeName) {
            this.setState({
                theme: nextProps.theme,
            });
        }
    }

    setTheme = () => {
        this.props.updateTheme(
            this.state.theme,
            Math.random()
                .toString(36)
                .slice(-5),
        );

        this.props.generateAlert('success', 'Theme applied', 'Theme applied to the styleguide');
    };

    updateColor = (set, color, value) => {
        const theme = Object.assign({}, this.state.theme);
        theme[set][color] = value;

        this.props.updateTheme(
            theme,
            Math.random()
                .toString(36)
                .slice(-5),
        );
    };

    render() {
        const { theme } = this.state;

        return (
            <div className={css.colors}>
                <h1>Colors</h1>
                {Object.keys(theme).map((set) => {
                    return (
                        <React.Fragment key={set}>
                            {Object.keys(theme[set]).map((color) => {
                                return (
                                    <div key={`${set}.${color}`}>
                                        <div style={{ background: theme[set][color] }} />
                                        <strong>
                                            {set}.{color} <br />
                                            <input
                                                value={theme[set][color]}
                                                onChange={(e) => this.updateColor(set, color, e.target.value)}
                                            />
                                        </strong>
                                        <span>
                                            {colorTitles[`${set}.${color}`]} <em>{colorExamples[`${set}.${color}`]}</em>
                                        </span>
                                    </div>
                                );
                            })}
                            <hr />
                        </React.Fragment>
                    );
                })}
                <h1>Theme source:</h1>
                <textarea value={JSON.stringify(theme, null, '\t')} readOnly />
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    updateTheme,
    generateAlert,
};
export default connect(mapStateToProps, mapDispatchToProps)(Colors);
