import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { setMode } from 'actions/settings';

import Toggle from 'ui/components/Toggle';

/**
 * Wallet mode component
 **/
class Mode extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        mode: PropTypes.string.isRequired,
        /** @ignore */
        setMode: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { mode, setMode, t } = this.props;

        const targetMode = mode === 'Expert' ? 'Standard' : 'Expert';

        return (
            <form>
                <h3>{t('settings:mode')}</h3>
                <Toggle
                    checked={targetMode === 'Standard'}
                    onChange={() => setMode(targetMode)}
                    on={t('modeSelection:expert')}
                    off={t('modeSelection:standard')}
                />
                <p>
                    {t('modeSelection:expertModeExplanation')} {t('modeSelection:modesExplanation')}
                </p>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    mode: state.settings.mode,
});

const mapDispatchToProps = {
    setMode,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Mode));
