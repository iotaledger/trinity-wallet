import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'libs/i18next';
import { setLocale } from '../../../../shared/actions/settings';

class LanguageSelect extends React.PureComponent {
    static propTypes = {
        locale: PropTypes.string,
        setLocale: PropTypes.func.isRequired,
    };

    static languages = {
        en: 'English',
        'es-ES': 'Español',
        de: 'Deutsch',
    };

    changeHandler = e => {
        const { target } = e;
        const { setLocale } = this.props;
        setLocale(target.value);
        i18next.changeLanguage(target.value);
    };

    render() {
        const { locale } = this.props;

        return (
            <select defaultValue={locale} onChange={this.changeHandler}>
                <option value="en">English (International)</option>
                <option value="ar">عربى - Arabic</option>
                <option value="da">Dansk - Danish</option>
                <option value="de">Deutsch - German</option>
                <option value="el">Ελληνικά - Greek</option>
                <option value="es_ES">Español (España) - Spanish (Spain)</option>
                <option value="es_LA">Español (Latinoamérica) - Spanish (Latin America)</option>
                <option value="fi">Suomi - Finnish</option>
                <option value="fr">Français - French</option>
                <option value="he">עִברִית - Hebrew</option>
                <option value="hi">हिंदी - Hindi</option>
                <option value="id">Indonesian</option>
                <option value="it">Italiano - Italian</option>
                <option value="ja">日本語 - Japanese</option>
                <option value="ko">한국어 - Korean</option>
                <option value="lv">Latvian</option>
                <option value="nl">Nederlands - Dutch</option>
                <option value="no">Norsk - Norwegian</option>
                <option value="pl">Polski - Polish</option>
                <option value="pt_BR">Português (Brasil) - Portuguese (Brazil)</option>
                <option value="pt_PT">Português (Portugal) - Portuguese (Portugal)</option>
                <option value="ro">Română - Romanian</option>
                <option value="ru">Pусский - Russian</option>
                <option value="sl">Slovenian</option>
                <option value="sv_SE">Svenska - Swedish</option>
                <option value="tr">Türkçe - Turkish</option>
                <option value="ur">Urdu</option>
                <option value="zh_CN">中文 (简体) - Chinese (Simplified)</option>
                <option value="zh_TW">中文 (繁體) - Chinese (Traditional)</option>
            </select>
        );
    }
}

const mapStateToProps = state => ({
    locale: state.settings.locale,
});

const mapDispatchToProps = {
    setLocale,
};

export default connect(mapStateToProps, mapDispatchToProps)(LanguageSelect);
