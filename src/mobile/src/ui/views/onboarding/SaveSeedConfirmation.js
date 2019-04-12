import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { navigator } from 'libs/navigation';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import timer from 'react-native-timer';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import InfoBox from 'ui/components/InfoBox';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import Header from 'ui/components/Header';
import Slider from 'ui/components/Slider';
import { Styling } from 'ui/theme/general';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { height } from 'libs/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 2.6,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    infoBox: {
        maxHeight: height / 3.7,
    },
});

/** Seed Seed Confirmation component */
class SaveSeedConfirmation extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            hasConfirmedBackup: false,
            hasAgreedToNotCopyPaste: !isAndroid,
            confirmationText: isAndroid ? props.t('willNotCopyPasteSeed') : props.t('iHaveBackedUp'),
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('SaveSeedConfirmation');
    }

    componentWillUnmount() {
        timer.clearTimeout('delayTextUpdate');
    }

    onBackPress() {
        navigator.pop(this.props.componentId);
    }

    onNextPress() {
        navigator.push('seedReentry');
    }

    onSwipeSuccess() {
        const { t } = this.props;
        if (!this.state.hasAgreedToNotCopyPaste) {
            this.setState({ hasAgreedToNotCopyPaste: true });
            return timer.setTimeout(
                'delayTextUpdate',
                () => this.setState({ confirmationText: t('iHaveBackedUp') }),
                1000,
            );
        }
        this.setState({ hasConfirmedBackup: true });
    }

    renderInfoBoxContent() {
        const { t, theme: { body } } = this.props;
        const textColor = { color: body.color };

        return (
            <ScrollView style={styles.infoBox} scrollEnabled={isAndroid}>
                <Text style={[styles.infoText, textColor]}>
                    <Text style={styles.infoTextBold}>{t('reenterSeed')}</Text>
                </Text>
                <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                    <Text style={styles.infoTextNormal}>{t('reenterSeedWarning')}</Text>
                </Text>
                <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>{t('pleaseConfirm')}</Text>
                {isAndroid && (
                    <View style={{ paddingTop: height / 50, alignItems: 'center' }}>
                        <Text style={[styles.infoTextNormal, textColor]}>
                            {t('global:androidInsecureClipboardWarning')}{' '}
                        </Text>
                        <Text style={[styles.infoTextBold, textColor]}>{t('global:androidCopyPasteWarning')}</Text>
                    </View>
                )}
            </ScrollView>
        );
    }

    render() {
        const { t, theme: { body, input, dark, primary, secondary } } = this.props;
        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topContainer}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={400}
                    >
                        <Header textColor={body.color}>{t('didSaveSeed')}</Header>
                    </AnimatedComponent>
                </View>
                <View style={styles.midContainer}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={300}
                    >
                        <InfoBox>{this.renderInfoBoxContent()}</InfoBox>
                    </AnimatedComponent>
                    <View style={{ flex: 0.3 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={200}
                    >
                        <Text style={[styles.infoTextBold, { color: body.color }]}>{this.state.confirmationText}</Text>
                    </AnimatedComponent>
                    <View style={{ flex: 0.3 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={100}
                    >
                        <Slider
                            filledColor={input.bg}
                            unfilledColor={dark.color}
                            textColor={body.color}
                            preSwipeColor={secondary.color}
                            postSwipeColor={primary.color}
                            onSwipeSuccess={() => {
                                this.onSwipeSuccess();
                            }}
                            sliderReset={this.state.hasAgreedToNotCopyPaste}
                            numberOfSliders={isAndroid ? 2 : 1}
                        />
                    </AnimatedComponent>
                    <View style={{ flex: 0.5 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                        <DualFooterButtons
                            onLeftButtonPress={() => this.onBackPress()}
                            onRightButtonPress={() => this.onNextPress()}
                            leftButtonText={t('global:goBack')}
                            rightButtonText={t('global:continue')}
                            disableRightButton={!this.state.hasConfirmedBackup}
                        />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

export default withNamespaces(['saveSeedConfirmation', 'global'])(connect(mapStateToProps)(SaveSeedConfirmation));
