import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { setMode } from 'actions/settings';

import Info from 'ui/components/Info';
import Toggle from 'ui/components/Toggle';

/** Wallet mode component */
class Mode extends React.PureComponent {
    static propTypes = {
        /** Current wallet mode
         */
        mode: PropTypes.string.isRequired,
        /** Change wallet mode
         * @param {String} Mode - Target wallet mode
         */
        setMode: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - Locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { mode, setMode, t } = this.props;

        const targetMode = mode === 'Expert' ? 'Standard' : 'Expert';

        return (
            <form>
                <Info>
                    <p>{t('modeSelection:expertModeExplanation')}</p>
                    <p>{t('modeSelection:modesExplanation')}</p>
                </Info>
                <Toggle
                    checked={targetMode === 'Standard'}
                    onChange={() => setMode(targetMode)}
                    on={t('modeSelection:expert')}
                    off={t('modeSelection:standard')}
                />
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
