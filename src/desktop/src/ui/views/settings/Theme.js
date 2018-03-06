import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { updateTheme } from 'actions/settings';
import themes from 'themes/themes';

import Select from 'ui/components/input/Select';
import Button from 'ui/components/Button';
import inputCSS from 'ui/components/input/input.css';
import Icon from 'ui/components/Icon';

import css from './index.css';

/** Theme switch component */
class Theme extends React.PureComponent {
    static propTypes = {
        /** Current theme name
         * @ignore
         */
        themeName: PropTypes.string.isRequired,
        /** Change theme
         * @param {Object} theme - Theme object
         * @param {String} name - Theme name
         * @ignore
         */
        updateTheme: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        themeName: null,
    };

    render() {
        const { themeName } = this.state;
        const { updateTheme, t } = this.props;

        const theme = themeName ? themes[themeName] : themes[this.props.themeName];

        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (themeName) {
                        updateTheme(themes[themeName], themeName);
                    }
                }}
            >
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
                <div className={css.mockup} style={{ background: theme.body.bg }}>
                    <p style={{ color: theme.body.color }}>Mockup</p>
                    <div className={inputCSS.input} style={{ marginBottom: 10 }}>
                        <fieldset>
                            <a
                                style={{
                                    color: theme.input.alt,
                                }}
                                className={inputCSS.strike}
                            >
                                <Icon icon="eye" size={16} />
                            </a>
                            <input
                                style={{
                                    background: theme.input.bg,
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
                            background: theme.positive.bg || theme.positive.color,
                        }}
                    >
                        {t('global:save')}
                    </Button>
                    <Button
                        style={{
                            color: theme.highlight.color,
                            borderColor: theme.highlight.color,
                            background: 'none',
                        }}
                    >
                        {t('global:back')}
                    </Button>
                    <Button
                        style={{
                            color: theme.negative.color,
                            borderColor: theme.negative.color,
                            background: 'none',
                        }}
                    >
                        {t('global:close')}
                    </Button>
                    <Button
                        style={{
                            color: theme.extra.color,
                            borderColor: theme.extra.color,
                            background: 'none',
                        }}
                    >
                        {t('global:next')}
                    </Button>
                </div>
                <fieldset>
                    <Button type="submit" disabled={!themeName || themeName === this.props.themeName}>Save</Button>
                </fieldset>
            </form>
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
