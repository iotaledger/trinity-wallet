import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Image, ImageBackground, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { I18N_LOCALE_LABELS, I18N_LOCALES } from 'iota-wallet-shared-modules/libs/i18n';
import i18next from 'i18next';
import setFirstUse from 'iota-wallet-shared-modules/actions/account.js';
import { detectLocale, selectLocale } from '../components/locale';
import locale from 'react-native-locale-detector';
import Dropdown from '../components/dropdown';

const width = Dimensions.get('window').width;
const height = global.height;

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
    helloBackground: {
        position: 'absolute',
        width,
        height: width / 0.95,
    },
    dropdownWidth: {
        width: width / 2,
    },
});

class LanguageSetup extends React.Component {
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

    clickDropdownItem(language) {
        // const languageIndex = I18N_LOCALE_LABELS.findIndex(l => l === language);
        // i18next.changeLanguage(I18N_LOCALES[languageIndex]);
    }

    render() {
        return (
            <ImageBackground source={require('iota-wallet-shared-modules/images/bg-green.png')} style={{ flex: 1 }}>
                <View style={styles.container}>
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
                        <Dropdown
                            title="Language"
                            dropdownWidth={styles.dropdownWidth}
                            defaultOption={I18N_LOCALE_LABELS[0]}
                            options={I18N_LOCALE_LABELS}
                            saveSelection={language => this.clickDropdownItem(language)}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={() => this.onNextPress()}>
                            <View style={styles.nextButton}>
                                <Text style={styles.nextText}>NEXT</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        );
    }
}

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(LanguageSetup);
