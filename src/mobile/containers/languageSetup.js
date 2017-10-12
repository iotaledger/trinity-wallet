import React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    LayoutAnimation,
    TouchableWithoutFeedback,
    Image,
    ImageBackground,
    StatusBar
} from 'react-native';
import Triangle from 'react-native-triangle';

const { height, width } = Dimensions.get('window');

const CustomLayoutSpring = {
    duration: 100,
    create: {
        type: LayoutAnimation.Types.spring,
        property: LayoutAnimation.Properties.scaleXY,
        springDamping: 0.7
    },
    update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7
    }
};

class LanguageSetup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            triangleDirection: 'down',
            dropdownHeight: 0,
            languageSelected: 'English (International)'
        };
    }

    onNextPress() {
        this.props.navigator.push({
            screen: 'welcome',
            navigatorStyle: {
                navBarHidden: true,
                screenBackgroundImageName: 'bg-green.png',
                screenBackgroundColor: '#102e36'
            },
            animated: false
        });
    }

    clickLanguage() {
        LayoutAnimation.configureNext(CustomLayoutSpring);
        switch (this.state.triangleDirection) {
            case 'down':
                this.setState({
                    triangleDirection: 'up',
                    dropdownHeight: height / 3
                });
                break;
            case 'up':
                this.setState({
                    triangleDirection: 'down',
                    dropdownHeight: 0
                });
                break;
        }
    }

    clickDropdownItem(item) {
        this.setState({
            dropdownHeight: 0,
            triangleDirection: 'down',
            languageSelected: item
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
                    <View style={{ height: height / 12 }}>
                        <View style={{ justifyContent: 'flex-start' }}>
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
                                alignItems: 'flex-start',
                                width: width / 1.5
                            }}
                        >
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('English (International)')}
                            >
                                English (International)
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('عربى - Arabic')}
                            >
                                عربى - Arabic
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Dansk - Danish')}
                            >
                                Dansk - Danish
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Deutsch - German')}
                            >
                                Deutsch - German
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Ελληνικά - German')}
                            >
                                Ελληνικά - Greek
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Español - Spanish')}
                            >
                                Español - Spanish
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Suomi - Finnish')}
                            >
                                Suomi - Finnish
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Français - French')}
                            >
                                Français - French
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('עִברִית - Hebrew')}
                            >
                                עִברִית
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('हिंदी - Hindi')}
                            >
                                हिंदी - Hindi
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Italiano - Italian')}
                            >
                                Italiano - Italian
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('日本語 - Japanese')}
                            >
                                日本語 - Japanese
                            </Text>
                            <Text style={styles.dropdownItem} onPress={event => this.clickDropdownItem('한국어 - Korean')}>
                                한국어 - Korean
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Nederlands - Dutch')}
                            >
                                Nederlands - Dutch
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Norsk - Norwegian')}
                            >
                                Norsk - Norwegian
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Polski - Polish')}
                            >
                                Polski - Polish
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Português (Brasil) - Portuguese (Brazil)')}
                            >
                                Português (Brasil) - Portuguese (Brazil)
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event =>
                                    this.clickDropdownItem('Português (Portugal) - Portuguese (Portugal)')}
                            >
                                Português (Portugal) - Portuguese (Portugal)
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Română - Romanian')}
                            >
                                Română - Romanian
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Pусский - Russian')}
                            >
                                Pусский - Russian
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Svenska - Swedish')}
                            >
                                Svenska - Swedish
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('Türkçe - Turkish')}
                            >
                                Türkçe - Turkish
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('中文 (简体) - Chinese (Simplified)')}
                            >
                                中文 (简体) - Chinese (Simplified)
                            </Text>
                            <Text
                                style={styles.dropdownItem}
                                onPress={event => this.clickDropdownItem('中文 (繁體) - Chinese (Traditional)')}
                            >
                                中文 (繁體) - Chinese (Traditional)
                            </Text>
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
        backgroundColor: '#102e36'
    },
    topContainer: {
        flex: 1.8,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22
    },
    midContainer: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 10
    },
    bottomContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 14
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 35
    },
    title: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent'
    },
    nextButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 16,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    nextText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        backgroundColor: 'transparent'
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5
    },
    dropdownTitle: {
        color: '#F7D002',
        fontFamily: 'Lato-Regular',
        fontSize: width / 33,
        backgroundColor: 'transparent'
    },
    dropdownItem: {
        color: 'white',
        fontSize: width / 20,
        fontFamily: 'Lato-Light',
        backgroundColor: 'transparent',
        textAlign: 'right',
        paddingTop: height / 100
    },
    dropdownButtonContainer: {
        flex: 1,
        paddingTop: height / 100
    },
    languageSelected: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 20,
        backgroundColor: 'transparent',
        paddingBottom: 4
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderBottomColor: 'white',
        borderBottomWidth: 0.7,
        width: width / 1.5
    }
});

export default LanguageSetup;
