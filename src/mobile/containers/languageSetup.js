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
    Image,
    ImageBackground,
    StatusBar,
} from 'react-native';
import Triangle from 'react-native-triangle';

const { height, width } = Dimensions.get('window');

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
            languageSelected: 'English (International)',
        };
    }

    onNextPress() {
        this.props.navigator.push({
            screen: 'welcome',
            navigatorStyle: {
                navBarHidden: true,
                screenBackgroundImageName: 'bg-green.png',
                screenBackgroundColor: '#102e36',
            },
            animated: false,
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

    clickDropdownItem(item) {
        this.setState({
            dropdownHeight: 0,
            triangleDirection: 'down',
            languageSelected: item,
        });
    }

    render() {
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>HELLO / SALUT / HOLA / HALLO</Text>
                    </View>
                </View>
                <View style={styles.midContainer}>
                    <View style={{ alignItems: 'center' }}>
                        <View>
                            <Text style={styles.dropdownTitle}>Language</Text>
                            <View style={styles.dropdownButtonContainer}>
                                <TouchableWithoutFeedback onPress={event => this.clickLanguage()}>
                                    <View style={styles.dropdownButton}>
                                        <Text style={styles.languageSelected}>{this.state.languageSelected}</Text>
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
                                <TouchableOpacity onPress={event => this.clickDropdownItem('English (International)')}>
                                    <Text style={styles.dropdownItem}>English (International)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('عربى - Arabic')}>
                                    <Text style={styles.dropdownItem}>عربى - Arabic</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Dansk - Danish')}>
                                    <Text style={styles.dropdownItem}>Dansk - Danish</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Deutsch - German')}>
                                    <Text style={styles.dropdownItem}>Deutsch - German</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Ελληνικά - Greek')}>
                                    <Text style={styles.dropdownItem}>Ελληνικά - Greek</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Español - Spanish')}>
                                    <Text style={styles.dropdownItem}>Español - Spanish</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Suomi - Finnish')}>
                                    <Text style={styles.dropdownItem}>Suomi - Finnish</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Français - French')}>
                                    <Text style={styles.dropdownItem}>Français - French</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('עִברִית - Hebrew')}>
                                    <Text style={styles.dropdownItem}>עִברִית - Hebrew</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('हिंदी - Hindi')}>
                                    <Text style={styles.dropdownItem}>हिंदी - Hindi</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Italiano - Italian')}>
                                    <Text style={styles.dropdownItem}>Italiano - Italian</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('日本語 - Japanese')}>
                                    <Text style={styles.dropdownItem}>日本語 - Japanese</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('한국어 - Korean')}>
                                    <Text style={styles.dropdownItem}>한국어 - Korean</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Nederlands - Dutch')}>
                                    <Text style={styles.dropdownItem}>Nederlands - Dutch</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Norsk - Norwegian')}>
                                    <Text style={styles.dropdownItem}>Norsk - Norwegian</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Polski - Polish')}>
                                    <Text style={styles.dropdownItem}>Polski - Polish</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={event =>
                                        this.clickDropdownItem('Português (Brasil) - Portuguese (Brazil)')}
                                >
                                    <Text style={styles.dropdownItem}>Português (Brasil) - Portuguese (Brazil)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={event =>
                                        this.clickDropdownItem('Português (Portugal) - Portuguese (Portugal)')}
                                >
                                    <Text style={styles.dropdownItem}>
                                        Português (Portugal) - Portuguese (Portugal)
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Română - Romanian')}>
                                    <Text style={styles.dropdownItem}>Română - Romanian</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Pусский - Russian')}>
                                    <Text style={styles.dropdownItem}>Pусский - Russian</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Svenska - Swedish')}>
                                    <Text style={styles.dropdownItem}>Svenska - Swedish</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={event => this.clickDropdownItem('Türkçe - Turkish')}>
                                    <Text style={styles.dropdownItem}>Türkçe - Turkish</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={event => this.clickDropdownItem('中文 (简体) - Chinese (Simplified)')}
                                >
                                    <Text style={styles.dropdownItem}>中文 (简体) - Chinese (Simplified)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={event => this.clickDropdownItem('中文 (繁體) - Chinese (Traditional)')}
                                >
                                    <Text style={styles.dropdownItem}>中文 (繁體) - Chinese (Traditional)</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={event => this.onNextPress()}>
                        <View style={styles.nextButton}>
                            <Text style={styles.nextText}>NEXT</Text>
                        </View>
                    </TouchableOpacity>
                </View>
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
});

export default LanguageSetup;
