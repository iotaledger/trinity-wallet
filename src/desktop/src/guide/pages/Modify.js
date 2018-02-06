import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateTheme } from 'actions/settings';
import { showNotification } from 'actions/notifications';

import Input from 'components/UI/input/Text';
import Button from 'ui/components/Button';
import Clipboard from 'ui/components/Clipboard';

import css from './modify.css';

const colors = ['primary', 'secondary', 'positive', 'negative', 'highlight', 'extra'];

class ModifyTheme extends React.Component {
    static propTypes = {
        theme: PropTypes.object.isRequired,
        themeName: PropTypes.string.isRequired,
        updateTheme: PropTypes.func.isRequired,
        showNotification: PropTypes.func.isRequired,
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

        this.props.showNotification({
            type: 'success',
            title: 'Theme applied',
            text: 'Theme applied to the styleguide',
        });
    };

    updateColor = (color, type, value) => {
        const theme = Object.assign({}, this.state.theme);
        theme[color][type] = value;

        this.setState({
            theme: theme,
        });
    };

    render() {
        const { theme } = this.state;

        return (
            <div className={css.modify}>
                <h1>Update theme</h1>

                <div className={css.columns}>
                    <ul>
                        {colors.map((color) => {
                            return (
                                <li className={css.preview} key={color}>
                                    <div>
                                        <span style={{ background: theme[color].color }} />
                                        <Input
                                            label={`${color} color`}
                                            value={theme[color].color}
                                            onChange={(value) => this.updateColor(color, 'color', value)}
                                        />
                                    </div>
                                    <div>
                                        <span style={{ background: theme[color].hover }} />
                                        <Input
                                            label={`${color} hover`}
                                            value={theme[color].hover}
                                            onChange={(value) => this.updateColor(color, 'hover', value)}
                                        />
                                    </div>
                                    <div>
                                        <span style={{ background: theme[color].body || theme.body.color }} />
                                        <Input
                                            label={`${color} body`}
                                            value={theme[color].body || theme.body.color}
                                            onChange={(value) => this.updateColor(color, 'body', value)}
                                        />
                                    </div>
                                    <hr />
                                </li>
                            );
                        })}
                    </ul>
                    <ul>
                        <li className={css.preview}>
                            <div>
                                <span style={{ background: theme.body.color }} />
                                <Input
                                    label="Body color"
                                    value={theme.body.color}
                                    onChange={(value) => this.updateColor('body', 'color', value)}
                                />
                            </div>
                            <div>
                                <span style={{ background: theme.body.bg }} />
                                <Input
                                    label="Body background"
                                    value={theme.body.background}
                                    onChange={(value) => this.updateColor('body', 'bg', value)}
                                />
                            </div>
                            <div>
                                <span style={{ background: theme.body.alt }} />
                                <Input
                                    label="Body alternative"
                                    value={theme.body.alt}
                                    onChange={(value) => this.updateColor('body', 'alt', value)}
                                />
                            </div>
                            <hr />
                        </li>
                        <li className={css.preview}>
                            <div>
                                <span style={{ background: theme.bar.color }} />
                                <Input
                                    label="Bar color"
                                    value={theme.bar.color}
                                    onChange={(value) => this.updateColor('bar', 'color', value)}
                                />
                            </div>
                            <div>
                                <span style={{ background: theme.bar.bg }} />
                                <Input
                                    label="Bar background"
                                    value={theme.bar.bg}
                                    onChange={(value) => this.updateColor('bar', 'bg', value)}
                                />
                            </div>
                            <div>
                                <span style={{ background: theme.bar.alt }} />
                                <Input
                                    label="Bar alternative"
                                    value={theme.bar.alt}
                                    onChange={(value) => this.updateColor('bar', 'alt', value)}
                                />
                            </div>
                            <hr />
                        </li>
                        <li className={css.preview}>
                            <div>
                                <span style={{ background: theme.input.color }} />
                                <Input
                                    label="Input color"
                                    value={theme.input.color}
                                    onChange={(value) => this.updateColor('input', 'color', value)}
                                />
                            </div>
                            <div>
                                <span style={{ background: theme.input.bg }} />
                                <Input
                                    label="Input background"
                                    value={theme.input.bg}
                                    onChange={(value) => this.updateColor('input', 'bg', value)}
                                />
                            </div>
                            <div>
                                <span style={{ background: theme.input.alt }} />
                                <Input
                                    label="Input alternative"
                                    value={theme.input.alt}
                                    onChange={(value) => this.updateColor('input', 'alt', value)}
                                />
                            </div>
                            <hr />
                        </li>
                        <li className={css.preview}>
                            <div>
                                <span style={{ background: theme.label.color }} />
                                <Input
                                    label="Label color"
                                    value={theme.label.color}
                                    onChange={(value) => this.updateColor('label', 'color', value)}
                                />
                            </div>
                            <div>
                                <span style={{ background: theme.label.active || theme.primary.color }} />
                                <Input
                                    label="Label active"
                                    value={theme.label.active || theme.primary.color}
                                    onChange={(value) => this.updateColor('label', 'active', value)}
                                />
                            </div>
                            <hr />
                        </li>
                        <li className={css.preview}>
                            <div>
                                <span style={{ background: theme.chart.color }} />
                                <Input
                                    label="Chart color"
                                    value={theme.chart.color}
                                    onChange={(value) => this.updateColor('chart', 'color', value)}
                                />
                            </div>
                            <hr />
                        </li>
                    </ul>
                </div>

                <hr />

                <Button variant="primary" onClick={this.setTheme}>
                    Update
                </Button>
                <Clipboard
                    text={JSON.stringify(theme)}
                    label="Copy to clipboard"
                    title="Copied to clipboard"
                    success="Theme data is copied to clipboard"
                />
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
    showNotification,
};

export default connect(mapStateToProps, mapDispatchToProps)(ModifyTheme);
