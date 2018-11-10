import { withNamespaces, Trans } from 'react-i18next';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import WithBackPressGoToHome from 'ui/components/BackPressGoToHome';
import { width, height } from 'libs/dimensions';
import Fonts from 'ui/theme/fonts';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import { Icon } from 'ui/theme/icons';
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
        flex: 1.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midWrapper: {
        flex: 2.1,
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
        textAlign: 'left',
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
        const { theme: { body } } = this.props;

        Navigation.push('appStack', {
            component: {
                name: 'walletResetRequirePassword',
                options: {
                    animations: {
                        push: {
                            enable: false,
                        },
                        pop: {
                            enable: false,
                        },
                    },
                    layout: {
                        backgroundColor: body.bg,
                        orientation: ['portrait'],
                    },
                    topBar: {
                        visible: false,
                        drawBehind: true,
                        elevation: 0,
                    },
                    statusBar: {
                        drawBehind: true,
                        backgroundColor: body.bg,
                    },
                },
            },
        });
    }

    /**
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        Navigation.pop(this.props.componentId);
    }

    render() {
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };
        const backgroundColor = { backgroundColor: theme.body.bg };
        const primaryColor = { color: theme.negative.color };

        return (
            <View style={[styles.container, backgroundColor]}>
                <View style={styles.topWrapper}>
                    <Icon name="iota" size={width / 8} color={theme.body.color} />
                </View>
                <View style={styles.midWrapper}>
                    <Text style={[styles.confirmationText, textColor]}>{t('global:continue?')}</Text>
                    <View style={{ flex: 0.2 }} />
                    <Text style={[styles.subHeaderText, primaryColor]}>{t('walletResetConfirmation:cannotUndo')}</Text>
                    <View style={{ flex: 0.4 }} />
                    <InfoBox
                        body={theme.body}
                        text={
                            <Trans i18nKey="walletResetConfirmation:warning">
                                <Text style={[styles.infoText, textColor]}>
                                    <Text style={styles.infoTextLight}>All of your wallet data including your </Text>
                                    <Text style={styles.infoTextRegular}>seeds, password,</Text>
                                    <Text style={styles.infoTextLight}> and </Text>
                                    <Text style={styles.infoTextRegular}>other account information</Text>
                                    <Text style={styles.infoTextLight}> will be lost.</Text>
                                </Text>
                            </Trans>
                        }
                    />
                </View>
                <View style={styles.bottomWrapper}>
                    <DualFooterButtons
                        onLeftButtonPress={this.goBack}
                        onRightButtonPress={this.navigateToPasswordConfirmation}
                        leftButtonText={t('global:no')}
                        rightButtonText={t('global:yes')}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default WithBackPressGoToHome()(
    withNamespaces(['walletResetConfirmation', 'global'])(connect(mapStateToProps)(WalletResetConfirmation)),
);
