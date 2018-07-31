import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { updateTheme } from 'actions/settings';
import themes from 'themes/themes';

import Select from 'ui/components/input/Select';
import Button from 'ui/components/Button';
import inputCSS from 'ui/components/input/input.scss';
import Icon from 'ui/components/Icon';

import css from './index.scss';

/**
 * Theme switch component
 **/
class Theme extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        updateTheme: PropTypes.func.isRequired,
        /** @ignore */
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
                        document.body.style.background = themes[themeName].body.bg;
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
                    <p style={{ color: theme.body.color }}>{t('themeCustomisation:mockup')}</p>
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
                    <div>
                        <Button
                            style={{
                                color: theme.dark.body,
                                background: theme.dark.color,
                            }}
                        >
                            {t('no')}
                        </Button>
                        <Button
                            style={{
                                color: theme.primary.body,
                                background: theme.primary.color,
                            }}
                        >
                            {t('yes')}
                        </Button>
                    </div>
                </div>
                <fieldset>
                    <Button type="submit" disabled={!themeName || themeName === this.props.themeName}>
                        {t('global:save')}
                    </Button>
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

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(translate()(Theme));
