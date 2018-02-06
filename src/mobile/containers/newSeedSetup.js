import split from 'lodash/split';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
    ListView,
    TouchableOpacity,
    Image,
    BackHandler,
} from 'react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { connect } from 'react-redux';
import { randomiseSeed, setSeed, clearSeed } from 'iota-wallet-shared-modules/actions/tempAccount';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import { randomBytes } from 'react-native-randombytes';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import StatefulDropdownAlert from './statefulDropdownAlert';
import { Navigation } from 'react-native-navigation';
import OnboardingButtons from '../components/onboardingButtons';
import glowIotaImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import GENERAL from '../theme/general';
import CtaButton from '../components/ctaButton';

import { width, height } from '../util/dimensions';
import { isIPhoneX } from '../util/device';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class NewSeedSetup extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        tempAccount: PropTypes.object.isRequired,
        setSeed: PropTypes.func.isRequired,
        randomiseSeed: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        ctaColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        onboardingComplete: PropTypes.bool.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        secondaryCtaColor: PropTypes.string.isRequired,
        ctaBorderColor: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.state = {
            randomised: false,
            infoTextColor: 'transparent',
        };
    }

    componentDidMount() {
        if (this.props.onboardingComplete) {
            BackHandler.addEventListener('newSeedSetupBackPress', () => {
                this.goBack();
                return true;
            });
        }
    }

    componentWillUnmount() {
        if (this.props.onboardingComplete) {
            BackHandler.removeEventListener('newSeedSetupBackPress');
        }
    }

    goBack() {
        // TODO: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: this.props.backgroundColor,
                },
            },
            appStyle: {
                orientation: 'portrait',
            },
        });
    }

    onGeneratePress() {
        this.props.randomiseSeed(randomBytes);
        this.setState({ randomised: true, infoTextColor: this.props.secondaryBackgroundColor });
    }

    onNextPress() {
        const { t } = this.props;

        if (this.state.randomised) {
            this.props.navigator.push({
                screen: 'saveYourSeed',
                navigatorStyle: { navBarHidden: true, navBarTransparent: true },
                animated: false,
                screenBackgroundColor: this.props.backgroundColor,
            });
        } else {
            this.props.generateAlert('error', t('seedNotGenerated'), t('seedNotGeneratedExplanation'));
        }
    }

    onBackPress() {
        this.props.clearSeed();
        if (!this.props.account.onboardingComplete) {
            this.props.navigator.pop({
                animated: false,
            });
        } else {
            // FIXME: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
            this.goBack();
        }
    }

    onItemPress(sectionID) {
        if (this.state.randomised) {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
            randomBytes(5, (error, bytes) => {
                if (!error) {
                    let i = 0;
                    let seed = this.props.tempAccount.seed;
                    Object.keys(bytes).map((key, index) => {
                        if (bytes[key] < 243 && i < 1) {
                            const randomNumber = bytes[key] % 27;
                            const randomLetter = charset.charAt(randomNumber);
                            const substr1 = seed.substr(0, sectionID);
                            sectionID++;
                            const substr2 = seed.substr(sectionID, 80);
                            seed = substr1 + randomLetter + substr2;
                            i++;
                        }
                    });
                    this.props.setSeed(seed);
                } else {
                    console.log(error);
                }
            });
        }
    }

    render() {
        const {
            tempAccount: { seed },
            t,
            ctaColor,
            backgroundColor,
            negativeColor,
            secondaryBackgroundColor,
            secondaryCtaColor,
            ctaBorderColor,
        } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const viewOpacity = this.state.randomised ? 1 : 0.1;
        const ctaTextColor = { color: secondaryCtaColor };
        const iotaImagePath = secondaryBackgroundColor === 'white' ? glowIotaImagePath : blackIotaImagePath;
        return (
            <View style={[styles.container, { backgroundColor: backgroundColor }]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                <View style={styles.topContainer}>
                    <Image source={iotaImagePath} style={styles.iotaLogo} />
                    <View style={{ flex: 150 }} />
                    <CtaButton
                        ctaColor={ctaColor}
                        ctaBorderColor={ctaBorderColor}
                        secondaryCtaColor={secondaryCtaColor}
                        text={t('pressForNewSeed')}
                        onPress={() => {
                            this.onGeneratePress();
                        }}
                        ctaWidth={width / 1.6}
                        testID="newSeedSetup-newSeed"
                    />
                </View>
                <View style={styles.midContainer}>
                    <View style={{ flex: isIPhoneX ? 100 : 30 }} />
                    <ListView
                        contentContainerStyle={[styles.list, { opacity: viewOpacity }]}
                        dataSource={ds.cloneWithRows(split(seed, ''))}
                        renderRow={(rowData, rowID, sectionID) => (
                            <TouchableHighlight
                                key={sectionID}
                                onPress={event => this.onItemPress(sectionID)}
                                style={[styles.tileContainer, { backgroundColor: secondaryBackgroundColor }]}
                                underlayColor={negativeColor}
                            >
                                <View style={styles.tile}>
                                    <Text
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: backgroundColor,
                                            fontFamily: 'Lato-Bold',
                                            fontSize: width / 28.9,
                                            textAlign: 'center',
                                            opacity: viewOpacity,
                                        }}
                                    >
                                        {rowData}
                                    </Text>
                                </View>
                            </TouchableHighlight>
                        )}
                        style={styles.gridContainer}
                        initialListSize={MAX_SEED_LENGTH}
                        scrollEnabled={false}
                        enableEmptySections
                    />
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 100 }}>
                        <Text
                            style={{
                                color: this.state.infoTextColor,
                                fontFamily: 'Lato-Light',
                                textAlign: 'center',
                                fontSize: width / 27.6,
                                backgroundColor: 'transparent',
                            }}
                        >
                            {t('individualLetters')}
                        </Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onBackPress()}
                        onRightButtonPress={() => this.onNextPress()}
                        leftText={t('global:back')}
                        rightText={t('global:next')}
                        leftButtonTestID="newSeedSetup-back"
                        rightButtonTestID="newSeedSetup-next"
                    />
                </View>
                <StatefulDropdownAlert />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    topContainer: {
        flex: 2.1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 5.55,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bottomContainer: {
        flex: 0.75,
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    list: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: width / 20,
    },
    gridContainer: {
        //  flex: 1
    },
    tile: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    tileContainer: {
        width: width / 14.5,
        height: width / 14.5,
        justifyContent: 'center',
        alignItems: 'center',
        margin: width / 80,
    },
    generateButton: {
        borderRadius: GENERAL.borderRadius,
        width: width / 2.2,
        height: height / 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.2,
    },
    generateText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    buttonsContainer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    rightText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    leftButton: {
        borderColor: '#F7D002',
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginRight: width / 14,
    },
    leftText: {
        color: '#F7D002',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    account: state.account,
    backgroundColor: state.settings.theme.backgroundColor,
    ctaColor: state.settings.theme.ctaColor,
    negativeColor: state.settings.theme.negativeColor,
    onboardingComplete: state.account.onboardingComplete,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
    secondaryCtaColor: state.settings.theme.secondaryCtaColor,
    ctaBorderColor: state.settings.theme.ctaBorderColor,
});

const mapDispatchToProps = {
    setSeed,
    clearSeed,
    randomiseSeed,
    generateAlert,
};

export default translate(['newSeedSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(NewSeedSetup));
