import React from 'react';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import navigator from 'libs/navigation';
import { toggleModalActivity, setDoNotMinimise } from 'shared-modules/actions/ui';
import { setAccountInfoDuringSetup } from 'shared-modules/actions/accounts';
import { generateAlert } from 'shared-modules/actions/alerts';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import WithUserActivity from 'ui/components/UserActivity';
import DropdownComponent from 'ui/components/Dropdown';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import { isIPhoneX, isAndroid } from 'libs/device';

console.ignoredYellowBox = ['Native TextInput']; // eslint-disable-line no-console

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
        width,
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    seedVaultImportContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

/** MoonPay select account component */
class SelectAccount extends React.Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Determines if the application is minimised */
        minimised: PropTypes.bool.isRequired,
    };

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    static redirectToScreen(screen) {
        navigator.push(screen);
    }

    render() {
        const { t, theme, minimised } = this.props;

        return (
            <TouchableWithoutFeedback style={{ flex: 0.8 }} onPress={Keyboard.dismiss} accessible={false}>
                <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                    {!minimised && (
                        <View>
                            <View style={styles.topContainer}>
                                <AnimatedComponent
                                    animationInType={['slideInRight', 'fadeIn']}
                                    animationOutType={['slideOutLeft', 'fadeOut']}
                                    delay={400}
                                >
                                    <Header textColor={theme.body.color} />
                                </AnimatedComponent>
                            </View>
                            <View style={styles.midContainer}>
                                <AnimatedComponent
                                    animationInType={['slideInRight', 'fadeIn']}
                                    animationOutType={['slideOutLeft', 'fadeOut']}
                                    delay={300}
                                >
                                    <InfoBox>
                                        <Text style={[styles.infoText, { color: theme.body.color }]}>
                                            {t('moonpay:selectAccount')}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.infoTextRegular,
                                                { paddingTop: height / 60, color: theme.body.color },
                                            ]}
                                        >
                                            {t('moonpay:selectAccountExplanation')}
                                        </Text>
                                    </InfoBox>
                                </AnimatedComponent>
                                <View style={{ flex: 0.3 }} />
                                <AnimatedComponent
                                    animationInType={['slideInRight', 'fadeIn']}
                                    animationOutType={['slideOutLeft', 'fadeOut']}
                                    delay={200}
                                >
                                    <DropdownComponent
                                        onRef={(c) => {
                                            this.dropdown = c;
                                        }}
                                        dropdownWidth={{ width: isIPhoneX ? width / 1.1 : width / 1.2 }}
                                        value="foo"
                                        options={['foo', 'baz']}
                                        saveSelection={(account) => {}}
                                    />
                                </AnimatedComponent>
                                <View style={{ flex: 0.6 }} />
                            </View>
                            <View style={styles.bottomContainer}>
                                <AnimatedComponent
                                    animationInType={['fadeIn']}
                                    animationOutType={['fadeOut']}
                                    delay={0}
                                >
                                    <DualFooterButtons
                                        onLeftButtonPress={() => SelectAccount.redirectToScreen('addAmount')}
                                        onRightButtonPress={() => SelectAccount.redirectToScreen('enterEmail')}
                                        leftButtonText={t('global:goBack')}
                                        rightButtonText={t('global:confirm')}
                                        leftButtonTestID="enterSeed-back"
                                        rightButtonTestID="enterSeed-next"
                                    />
                                </AnimatedComponent>
                            </View>
                        </View>
                    )}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    minimised: state.ui.minimised,
});

const mapDispatchToProps = {
    generateAlert,
    toggleModalActivity,
    setAccountInfoDuringSetup,
    setDoNotMinimise,
};

export default WithUserActivity()(
    withTranslation()(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(SelectAccount),
    ),
);
