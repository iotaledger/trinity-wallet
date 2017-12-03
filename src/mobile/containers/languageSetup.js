import React from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Dimensions,
    Text,
    TouchableOpacity,
    LayoutAnimation,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
    ImageBackground,
    StatusBar,
} from 'react-native';
import { translate } from 'react-i18next';
import i18next from 'i18next';
import { connect } from 'react-redux';
import Triangle from 'react-native-triangle';
import setFirstUse from 'iota-wallet-shared-modules/actions/account.js';
import { detectLocale, selectLocale } from '../components/locale';
import locale from 'react-native-locale-detector';

const width = Dimensions.get('window').width;
const height = global.height;

const CustomLayoutSpring = {
    duration: 100,
    create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleXY,
        springDamping: 0.7,
    },
    update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
    },
};

class LanguageSetup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            triangleDirection: 'down',
            dropdownHeight: 0,
            lang: detectLocale(locale),
            languageSelected: selectLocale(detectLocale(locale)),
        };
    }

    componentDidMount() {
        i18next.changeLanguage(this.state.lang);
    }

    onNextPress() {
        this.props.navigator.push({
            screen: 'welcome',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    clickLanguage() {
        LayoutAnimation.configureNext(CustomLayoutSpring);
        switch (this.state.triangleDirection) {
            case 'down':
                this.setState({
                    triangleDirection: 'up',
                    dropdownHeight: height / 3.05,
                });
                break;
            case 'up':
                this.setState({
                    triangleDirection: 'down',
                    dropdownHeight: 0,
                });
                break;
        }
    }

    clickDropdownItem(item, translationResource) {
        this.setState({
            dropdownHeight: 0,
            triangleDirection: 'down',
            languageSelected: item,
        });

        i18next.changeLanguage(translationResource); // TODO: Remove || when passed appropriate strings for each resource
    }

    render() {
        const { t } = this.props;
        return (
            <ImageBackground source={require('iota-wallet-shared-modules/images/bg-blue.png')} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container} scrollEnabled={false}>
                    <Image
                        style={styles.helloBackground}
                        source={require('iota-wallet-shared-modules/images/hello-back.png')}
                    />
                    <StatusBar barStyle="light-content" />
                    <View style={styles.topContainer}>
                        <Image
                            source={require('iota-wallet-shared-modules/images/iota-glow.png')}
                            style={styles.iotaLogo}
                        />
                        <View style={styles.titleContainer} />
                    </View>
                    <View style={styles.midContainer}>
                        <View style={{ alignItems: 'center' }}>
                            <View>
                                <Text style={styles.dropdownTitle}>{t('language')}</Text>
                                <View style={styles.dropdownButtonContainer}>
                                    <TouchableWithoutFeedback onPress={event => this.clickLanguage()}>
                                        <View style={styles.dropdownButton}>
                                            <Text numberOfLines={1} style={styles.languageSelected}>
                                                {this.state.languageSelected}
                                            </Text>
                                            <Triangle
                                                width={10}
                                                height={10}
                                                color={'white'}
                                                direction={this.state.triangleDirection}
                                                style={{ marginBottom: height / 80 }}
                                            />
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </View>
                            <View
                                style={{
                                    height: this.state.dropdownHeight,
                                    overflow: 'hidden',
                                    backgroundColor: 'transparent',
                                    width: width / 1.5,
                                    alignItems: 'flex-start',
                                }}
                            >
                                <ScrollView>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('English (International)', 'en')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            English (International)
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={event => this.clickDropdownItem('عربى - Arabic', 'ar')}>
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            عربى - Arabic
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={event => this.clickDropdownItem('Dansk - Danish', 'da')}>
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Dansk - Danish
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Deutsch - German', 'de')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Deutsch - German
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Ελληνικά - Greek', 'el')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Ελληνικά - Greek
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event =>
                                            this.clickDropdownItem('Español (España) - Spanish (Spain)', 'es_ES')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Español (España) - Spanish (Spain)
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event =>
                                            this.clickDropdownItem(
                                                'Español (Latinoamérica) - Spanish (Latin America)',
                                                'es_LA',
                                            )}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Español (Latinoamérica) - Spanish (Latin America)
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Suomi - Finnish', 'fi')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Suomi - Finnish
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Français - French', 'fr')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Français - French
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('עִברִית - Hebrew', 'he')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            עִברִית - Hebrew
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={event => this.clickDropdownItem('हिंदी - Hindi', 'hi')}>
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            हिंदी - Hindi
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Bahasa Indonesia - Indonesian', 'id')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Bahasa Indonesia - Indonesian
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Italiano - Italian', 'it')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Italiano - Italian
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={event => this.clickDropdownItem('日本語 - Japanese', 'ja')}>
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            日本語 - Japanese
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={event => this.clickDropdownItem('한국어 - Korean', 'ko')}>
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            한국어 - Korean
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Latviešu - Latvian', 'lv')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Latviešu - Latvian
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Nederlands - Dutch', 'nl')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Nederlands - Dutch
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Norsk - Norwegian', 'no')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Norsk - Norwegian
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Polski - Polish', 'pl')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Polski - Polish
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event =>
                                            this.clickDropdownItem('Português (Brasil) - Portuguese (Brazil)', 'pt_BR')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Português (Brasil) - Portuguese (Brazil)
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event =>
                                            this.clickDropdownItem(
                                                'Português (Portugal) - Portuguese (Portugal)',
                                                'pt_PT',
                                            )}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Português (Portugal) - Portuguese (Portugal)
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Română - Romanian', 'ro')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Română - Romanian
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Pусский - Russian', 'ru')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Pусский - Russian
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Slovenščina - Slovenian', 'sl')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Slovenščina - Slovenian
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Svenska - Swedish', 'sv_SE')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Svenska - Swedish
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event => this.clickDropdownItem('Türkçe - Turkish', 'tr')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            Türkçe - Turkish
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={event => this.clickDropdownItem('اردو - Urdu', 'ur')}>
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            اردو - Urdu
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event =>
                                            this.clickDropdownItem('中文 (简体) - Chinese (Simplified)', 'zh_CN')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            中文 (简体) - Chinese (Simplified)
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={event =>
                                            this.clickDropdownItem('中文 (繁體) - Chinese (Traditional)', 'zh_TW')}
                                    >
                                        <Text numberOfLines={1} style={styles.dropdownItem}>
                                            中文 (繁體) - Chinese (Traditional)
                                        </Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={event => this.onNextPress()}>
                            <View style={styles.nextButton}>
                                <Text style={styles.nextText}>{t('global:next')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#102e36',
    },
    topContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bottomContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 15,
    },
    title: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    nextButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    nextText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    dropdownTitle: {
        color: '#F7D002',
        fontFamily: 'Lato-Regular',
        fontSize: width / 33,
        backgroundColor: 'transparent',
    },
    dropdownItem: {
        color: 'white',
        fontSize: width / 20,
        fontFamily: 'Lato-Light',
        backgroundColor: 'transparent',
        textAlign: 'left',
        paddingTop: height / 100,
        includeFontPadding: false,
    },
    dropdownButtonContainer: {
        paddingTop: height / 100,
    },
    languageSelected: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 20,
        backgroundColor: 'transparent',
        paddingBottom: height / 150,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderBottomColor: 'white',
        borderBottomWidth: 0.7,
        width: width / 1.5,
        height: height / 22,
    },
    helloBackground: {
        position: 'absolute',
        width: width,
        height: width / 0.95,
    },
});

const mapStateToProps = state => ({});

export default translate(['languageSetup', 'global'])(connect(mapStateToProps)(LanguageSetup));
