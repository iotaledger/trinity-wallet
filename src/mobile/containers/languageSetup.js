import React from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Dimensions,
    Text,
    TouchableOpacity,
    Image,
    ImageBackground,
    StatusBar,
} from 'react-native';
import { translate } from 'react-i18next';
import i18next from 'i18next';
import { connect } from 'react-redux';
import Triangle from 'react-native-triangle';
import { I18N_LOCALE_LABELS } from 'iota-wallet-shared-modules/i18n'
import setFirstUse from 'iota-wallet-shared-modules/actions/account.js';
import { detectLocale, selectLocale } from '../components/locale';
import locale from 'react-native-locale-detector';
import Dropdown from '../components/dropdown'

const width = Dimensions.get('window').width;
const height = global.height;


/* <View style={{ alignItems: 'center' }}>
    <View>
        <Text style={styles.dropdownTitle}>Language</Text>
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
            {I18N_LOCALE_LABELS.map((label) =>
                <TouchableOpacity onPress={() => this.clickDropdownItem(label)}>
                    <Text numberOfLines={1} style={styles.dropdownItem}>
                        {label}
                    </Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    </View>
</View> */



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
    languageSelected: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 20,
        backgroundColor: 'transparent',
        paddingBottom: height / 150,
    },
    helloBackground: {
        position: 'absolute',
        width,
        height: width / 0.95,
    },
    dropdownWidth: {
        width: width / 2,
    }
});

const DEFAULT_LOCALE_LABEL = I18N_LOCALE_LABELS[0]

class LanguageSetup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            languageSelected: DEFAULT_LOCALE_LABEL,
        };
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

    clickDropdownItem(language) {
        this.setState({ languageSelected: language });
    }

    render() {
        return (
            <ImageBackground source={require('iota-wallet-shared-modules/images/bg-blue.png')} style={{ flex: 1 }}>
                <View style={styles.container}>
                    <Image style={styles.helloBackground} source={require('iota-wallet-shared-modules/images/hello-back.png')} />
                    <StatusBar barStyle="light-content" />
                    <View style={styles.topContainer}>
                        <Image source={require('iota-wallet-shared-modules/images/iota-glow.png')} style={styles.iotaLogo} />
                        <View style={styles.titleContainer} />
                        <Dropdown
                            title="Language"
                            dropdownWidth={styles.dropdownWidth}
                            defaultOption={DEFAULT_LOCALE_LABEL}
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

export default translate(['languageSetup', 'global'])(connect(mapStateToProps)(LanguageSetup));
