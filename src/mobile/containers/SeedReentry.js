import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Keyboard, StyleSheet, View, Text, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/iota/utils';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import Checksum from '../components/Checksum';
import { width, height } from '../utils/dimensions';
import DynamicStatusBar from '../components/DynamicStatusBar';
import CustomTextInput from '../components/CustomTextInput';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import GENERAL from '../theme/general';
import InfoBox from '../components/InfoBox';
import OnboardingButtons from '../containers/OnboardingButtons';
import { Icon } from '../theme/icons';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 0.5,
        paddingTop: height / 16,
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3.7,
        alignItems: 'center',
        justifyContent: 'space-between',
        width,
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoTextTop: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBottom: {
        paddingTop: height / 60,
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 70,
        backgroundColor: 'transparent',
    },
    qrImage: {
        height: width / 28,
        width: width / 28,
        marginRight: width / 100,
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: GENERAL.borderRadius,
        width: width / 6,
        height: height / 16,
    },
    qrText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    textFieldContainer: {
        flex: 1,
        paddingRight: width / 30,
    },
    textField: {
        fontFamily: 'Inconsolata-Bold',
    },
    qrButtonContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height / 90,
    },
});

/** Seed Reentry component */
class SeedReentry extends Component {
    static propTypes = {
        /** Generate a notification alert
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Seed value */
        seed: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.state = {
            seed: '',
        };
    }

    onDonePress() {
        const { t, seed, theme: { body } } = this.props;
        if (this.state.seed === seed) {
            this.props.navigator.push({
                screen: 'setAccountName',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
                animated: false,
            });
        } else {
            this.props.generateAlert('error', t('incorrectSeed'), t('incorrectSeedExplanation'));
        }
    }

    onBackPress() {
        const { theme: { body } } = this.props;
        this.props.navigator.pop({
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
        const { seed } = this.state;
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                <DynamicStatusBar backgroundColor={theme.body.bg} />
                <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.topContainer}>
                            <View style={styles.logoContainer}>
                                <Icon name="iota" size={width / 8} color={theme.body.color} />
                            </View>
                        </View>
                        <View style={styles.midContainer}>
                            <View style={{ flex: 0.5 }} />
                            <CustomTextInput
                                label={t('global:seed')}
                                onChangeText={(text) => this.setState({ seed: text })}
                                containerStyle={{ width: width / 1.2 }}
                                maxLength={MAX_SEED_LENGTH}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                onSubmitEditing={() => this.onDonePress()}
                                theme={theme}
                                value={seed}
                            />
                            <View style={{ flex: 0.15 }} />
                            <Checksum seed={seed} theme={theme} />
                            <View style={{ flex: 0.15 }} />
                            <InfoBox
                                body={theme.body}
                                text={
                                    <View>
                                        <Text style={[styles.infoTextTop, textColor]}>{t('thisIsACheck')}</Text>
                                        <Text style={[styles.infoTextBottom, textColor]}>{t('ifYouHaveNotSaved')}</Text>
                                    </View>
                                }
                            />
                            <View style={{ flex: 0.5 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={() => this.onBackPress()}
                                onRightButtonPress={() => this.onDonePress()}
                                leftText={t('global:back')}
                                rightText={t('global:done')}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <StatefulDropdownAlert backgroundColor={theme.body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    generateAlert,
};

export default translate(['seedReentry', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SeedReentry));
