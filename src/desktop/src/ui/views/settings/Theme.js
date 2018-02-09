import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { updateTheme } from 'actions/settings';
import { themes } from 'themes/themes';

import Select from 'ui/components/input/Select';
import Button from 'ui/components/Button';
import inputCSS from 'ui/components/input/input.css';
import Icon from 'ui/components/Icon';

import css from './index.css';

class Theme extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        themeName: PropTypes.string.isRequired,
        updateTheme: PropTypes.func.isRequired,
    };

    state = {
        themeName: null,
    };

    render() {
        const { themeName } = this.state;
        const { t } = this.props;

        const theme = themeName ? themes[themeName] : themes[this.props.themeName];

        return (
            <div>
                <Select
                    label="Theme"
                    value={themeName || this.props.themeName}
                    onChange={(e) => this.setState({ themeName: e.target.value })}
                >
                    {Object.keys(themes).map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </Select>
                <div className={css.mockup} style={{ background: theme.body.background }}>
                    <p style={{ color: theme.body.color }}>Mockup</p>
                    <div className={inputCSS.input} style={{ marginBottom: 10 }}>
                        <fieldset>
                            <a
                                style={{
                                    color: theme.input.secondary || theme.body.color,
                                }}
                                className={inputCSS.strike}
                            >
                                <Icon icon="eye" size={16} />
                            </a>
                            <input
                                style={{
                                    background: theme.input.background,
                                    color: theme.input.color,
                                }}
                                type="text"
                                value="Lorem ipsum"
                                onChange={() => {}}
                            />
                            <small style={{ color: theme.body.color }}>Label</small>
                        </fieldset>
                    </div>
                    <Button
                        style={{
                            color: theme.positive.body || theme.body.color,
                            background: theme.positive.background || theme.positive.color,
                        }}
                    >
                        {t('global:save')}
                    </Button>
                    <Button
                        style={{
                            color: theme.highlight.color,
                            borderColor: theme.highlight.border || theme.highlight.color,
                            background: 'none',
                        }}
                    >
                        {t('global:back')}
                    </Button>
                    <Button
                        style={{
                            color: theme.negative.color,
                            borderColor: theme.negative.border || theme.negative.color,
                            background: 'none',
                        }}
                    >
                        {t('global:close')}
                    </Button>
                    <Button
                        style={{
                            color: theme.extra.color,
                            borderColor: theme.extra.border || theme.extra.color,
                            background: 'none',
                        }}
                    >
                        {t('global:next')}
                    </Button>
                </div>
                <Button
                    disabled={!themeName || themeName === this.props.themeName}
                    onClick={() => this.props.updateTheme(themes[themeName], themeName)}
                >
                    Save
                </Button>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    updateTheme,
};

export default translate('theme')(connect(mapStateToProps, mapDispatchToProps)(Theme));
