import React from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableWithoutFeedback, Image, ImageBackground } from 'react-native';
import { connect } from 'react-redux';
import { checkNode, setSeed } from '../actions/iotaActions';
import { requestMarketData, requestChartData, requestPrice } from '../actions/marketDataActions';

const { height, width } = Dimensions.get('window');

class SaveYourSeed extends React.Component {
    constructor(props) {
        super(props);
    }

    onNextClick() {
        this.props.navigator.push({
            screen: 'setPassword',
            navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png' },
            animated: false
        });
    }

    onBackClick() {
        this.props.navigator.pop({
            animated: false
        });
    }

    onCopyClick() {}

    onGenerateClick() {}

    render() {
        return (
            <ImageBackground source={require('../images/bg-green.png')} style={styles.container}>
                <View style={styles.topContainer}>
                    <Image source={require('../images/iota-glow.png')} style={styles.iotaLogo} />
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>SAVE YOUR SEED</Text>
                    </View>
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.leftContainer}>
                        <View>
                            <Text style={styles.optionText}>Option A</Text>
                            <Text style={styles.infoText}>
                                Copy down the seed shown opposite on paper. Triple check this to make sure you have
                                written it down correctly. We have split the seed into groups of 6 characters for easier
                                copying.
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.optionText}>Option B</Text>
                            <Text style={styles.infoText}>
                                Click the button opposite to generate a paper wallet. This will create an image that can
                                be printed out and stored safely for future use. Do not store this image in an
                                unencrypted electronic form.
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.optionText}>Option C</Text>
                            <Text style={styles.optionCText}>
                                <Text style={styles.infoText}>
                                    Click the button opposite to copy the seed to the clipboard. You can then paste it
                                    into your favourite password manager. This will only stay on your clipboard for{' '}
                                </Text>
                                <Text style={styles.warningText}>15 seconds.</Text>
                            </Text>
                        </View>
                    </View>
                    <View style={styles.rightContainer}>
                        <View style={styles.seedBox}>
                            <View>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(0, 6)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(12, 18)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(24, 30)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(36, 42)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(48, 54)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(60, 66)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(72, 78)}</Text>
                            </View>
                            <View>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(6, 12)}</Text>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(18, 24)}</Text>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(30, 36)}</Text>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(42, 48)}</Text>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(54, 60)}</Text>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(66, 72)}</Text>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(78, 81)}</Text>
                            </View>
                        </View>
                        <View style={{ paddingTop: height / 15 }}>
                            <TouchableWithoutFeedback onPress={event => this.onCopyClick()}>
                                <View style={styles.optionButton}>
                                    <Text style={styles.optionButtonText}>GENERATE PAPER WALLET</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={{ paddingTop: height / 18 }}>
                            <TouchableWithoutFeedback onPress={event => this.onGenerateClick()}>
                                <View style={styles.optionButton}>
                                    <Text style={styles.optionButtonText}>COPY SEED TO CLIPBOARD</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <View style={{ paddingRight: width / 16 }}>
                        <TouchableWithoutFeedback onPress={event => this.onBackClick()}>
                            <View style={styles.backButton}>
                                <Text style={styles.backText}>GO BACK</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <TouchableWithoutFeedback onPress={event => this.onNextClick()}>
                        <View style={styles.nextButton}>
                            <Text style={styles.nextText}>NEXT</Text>
                        </View>
                    </TouchableWithoutFeedback>
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
        barStyle: 'light-content'
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 30
    },
    midContainer: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: height / 20,
        paddingHorizontal: width / 15
    },
    bottomContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: height / 30
    },
    leftContainer: {
        flex: 1,
        alignItems: 'center',
        paddingRight: width / 10
    },
    rightContainer: {
        flex: 1,
        alignItems: 'flex-end',
        paddingTop: 3
    },
    optionText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 27,
        backgroundColor: 'transparent'
    },
    optionButtonText: {
        color: '#8BD4FF',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        textAlign: 'center',
        paddingHorizontal: width / 20,
        backgroundColor: 'transparent'
    },
    optionCText: {
        paddingTop: height / 80,
        backgroundColor: 'transparent'
    },
    optionButton: {
        borderColor: '#8BD4FF',
        borderWidth: 1.5,
        borderRadius: 15,
        width: width / 2.8,
        height: height / 7,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    seedBox: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 15,
        width: width / 2.2,
        height: height / 6,
        flexDirection: 'row',
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    seedBoxTextLeft: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 36.8,
        textAlign: 'left',
        letterSpacing: 3,
        backgroundColor: 'transparent'
    },
    seedBoxTextCenter: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 36.8,
        textAlign: 'left',
        paddingHorizontal: 10
    },
    seedBoxTextRight: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 36.8,
        textAlign: 'right',
        letterSpacing: 3,
        backgroundColor: 'transparent'
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width / 7,
        paddingTop: height / 35,
        paddingBottom: height / 30
    },
    title: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 20.25,
        textAlign: 'center',
        backgroundColor: 'transparent'
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 33.75,
        textAlign: 'left',
        paddingTop: height / 80,
        paddingBottom: height / 30,
        backgroundColor: 'transparent'
    },
    warningText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 33.75,
        textAlign: 'center',
        paddingTop: 7,
        backgroundColor: 'transparent'
    },
    nextButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.5,
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
    backButton: {
        borderColor: '#F7D002',
        borderWidth: 1.5,
        borderRadius: 10,
        width: width / 3,
        height: height / 16,
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    backText: {
        color: '#F7D002',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        backgroundColor: 'transparent'
    },
    iotaLogo: {
        height: width / 6,
        width: width / 6
    }
});

const mapStateToProps = state => ({
    iota: state.iota
});

const mapDispatchToProps = dispatch => ({
    checkNode: seed => {
        dispatch(checkNode(seed));
    },
    setSeed: seed => {
        dispatch(setSeed(seed));
    },
    requestMarketData: () => {
        dispatch(requestMarketData());
    },
    requestPrice: currency => {
        dispatch(requestPrice(currency));
    },
    requestChartData: (currency, timeFrame) => {
        dispatch(requestChartData(currency, timeFrame));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(SaveYourSeed);
