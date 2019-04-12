import { withNamespaces, Trans } from 'react-i18next';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { navigator } from 'libs/navigation';
import Fonts from 'ui/theme/fonts';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import Header from 'ui/components/Header';
import InfoBox from 'ui/components/InfoBox';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 1.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midWrapper: {
        flex: 1.8,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomWrapper: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    subHeaderText: {
        fontSize: Styling.fontSize5,
        fontFamily: 'SourceSansPro-Regular',
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoText: {
        fontSize: Styling.fontSize3,
        fontFamily: 'SourceSansPro-Light',
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: Fonts.tertiary,
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    confirmationText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/**
 * Wallet Reset Confirmation screen component
 */
class WalletResetConfirmation extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.goBack = this.goBack.bind(this);
        this.navigateToPasswordConfirmation = this.navigateToPasswordConfirmation.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('WalletResetConfirmation');
    }

    /**
     * Navigates to the provided screen
     * @param {string} url
     */
    navigateToPasswordConfirmation() {
        navigator.push('walletResetRequirePassword');
    }

    /**
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        navigator.pop(this.props.componentId);
    }

    render() {
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };
        const backgroundColor = { backgroundColor: theme.body.bg };
        const primaryColor = { color: theme.negative.color };

        return (
            <View style={[styles.container, backgroundColor]}>
                <View style={styles.topWrapper}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={400}
                    >
                        <Header textColor={theme.body.color} />
                    </AnimatedComponent>
                </View>
                <View style={styles.midWrapper}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={300}
                    >
                        <Text style={[styles.confirmationText, textColor]}>{t('global:continue?')}</Text>
                    </AnimatedComponent>
                    <View style={{ flex: 0.1 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={200}
                    >
                        <Text style={[styles.subHeaderText, primaryColor]}>
                            {t('walletResetConfirmation:cannotUndo')}
                        </Text>
                    </AnimatedComponent>
                    <View style={{ flex: 0.35 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={100}
                    >
                        <InfoBox>
                            <Trans i18nKey="walletResetConfirmation:warning">
                                <Text style={[styles.infoText, textColor]}>
                                    <Text style={styles.infoTextLight}>All of your wallet data including your </Text>
                                    <Text style={styles.infoTextRegular}>seeds, password,</Text>
                                    <Text style={styles.infoTextLight}> and </Text>
                                    <Text style={styles.infoTextRegular}>other account information</Text>
                                    <Text style={styles.infoTextLight}> will be lost.</Text>
                                </Text>
                            </Trans>
                        </InfoBox>
                    </AnimatedComponent>
                    <View style={{ flex: 0.1 }} />
                </View>
                <View style={styles.bottomWrapper}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                        <DualFooterButtons
                            onLeftButtonPress={this.goBack}
                            onRightButtonPress={this.navigateToPasswordConfirmation}
                            leftButtonText={t('global:no')}
                            rightButtonText={t('global:yes')}
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

export default withNamespaces(['walletResetConfirmation', 'global'])(connect(mapStateToProps)(WalletResetConfirmation));
