import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import OnboardingButtons from '../containers/OnboardingButtons';
import InfoBox from '../components/InfoBox';
import { Icon } from '../theme/icons.js';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 4,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'justify',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    greetingTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: width / 1.5,
    },
    greetingText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    questionText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});

class WalletSetup extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
        body: PropTypes.object.isRequired,
    };

    onYesPress() {
        const { body } = this.props;
        this.props.navigator.push({
            screen: 'enterSeed',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    onNoPress() {
        const { body } = this.props;
        this.props.navigator.push({
            screen: 'newSeedSetup',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    render() {
        const { t, body } = this.props;
        const textColor = { color: body.color };
        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                </View>
                <View style={styles.midContainer}>
                    <View style={{ flex: 0.7 }} />
                    <View style={styles.greetingTextContainer}>
                        <Text style={[styles.greetingText, textColor]}>{t('okay')}</Text>
                    </View>
                    <View style={{ flex: 0.5 }} />
                    <InfoBox
                        body={body}
                        text={
                            <View>
                                <Text style={[styles.infoText, textColor]}>{t('seedExplanation')}</Text>
                                <Trans i18nKey="walletSetup:explanation">
                                    <Text style={[styles.infoText, textColor]}>
                                        <Text style={styles.infoTextLight}>
                                            You can use it to access your funds from
                                        </Text>
                                        <Text style={styles.infoTextRegular}> any wallet</Text>
                                        <Text style={styles.infoTextLight}>, on</Text>
                                        <Text style={styles.infoTextRegular}> any device</Text>
                                        <Text style={styles.infoTextLight}>
                                            . But if you lose your seed, you also lose your IOTA.
                                        </Text>
                                    </Text>
                                </Trans>
                                <Text style={[styles.infoText, textColor]}>{t('keepSafe')}</Text>
                            </View>
                        }
                    />
                    <View style={{ flex: 0.5 }} />
                    <View style={styles.greetingTextContainer}>
                        <Text style={[styles.questionText, textColor]}>{t('doYouAlreadyHaveASeed')}</Text>
                    </View>
                    <View style={{ flex: 0.5 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onNoPress()}
                        onRightButtonPress={() => this.onYesPress()}
                        leftText={t('global:no')}
                        rightText={t('global:yes')}
                        leftButtonTestID="walletSetup-no"
                        rightButtonTestID="walletSetup-yes"
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    body: state.settings.theme.body,
});

export default translate(['walletSetup', 'global'])(connect(mapStateToProps, null)(WalletSetup));
