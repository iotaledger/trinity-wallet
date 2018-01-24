import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import LanguageSelect from 'components/UI/LanguageSelect';

class Language extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t } = this.props;
        return (
            <div>
                <LanguageSelect label={t('languageSetup:language')} />
            </div>
        );
    }
}

export default translate('setLanguage')(Language);
