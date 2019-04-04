import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { navigator } from 'libs/navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import RNPrint from 'react-native-print';
import { paperWallet } from 'shared-modules/images/PaperWallets.js';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import { getThemeFromState } from 'shared-modules/selectors/global';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { isAndroid } from 'libs/device';
import Header from 'ui/components/Header';
import InfoBox from 'ui/components/InfoBox';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

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
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        justifyContent: 'flex-end',
    },
    infoText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
        width: Styling.contentWidth,
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingTop: height / 30,
    },
});

/** Print Blank Template component */
class PrintBlankTemplate extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        this.state = {
            hasPressedPrint: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('PrintBlankTemplate');
    }

    /**
     * Wrapper method for printing a blank paper wallet
     * @method onPrintPress
     */
    onPrintPress() {
        this.print();
    }

    /**
     * Navigates back to the previous active screen in navigation stack
     * @method onBackPress
     */
    onBackPress() {
        navigator.pop(this.props.componentId);
    }

    /**
     * Navigates to write seed down page
     * @method onBackPress
     */
    onNextPress() {
        navigator.push('writeSeedDown');
    }

    /**
     *  Triggers blank paper wallet print
     *  @method print
     */
    async print() {
        const { theme: { body } } = this.props;
        const blankWalletHTML = `
            <!DOCTYPE html>
            <html>
            <head>
               <meta charset="utf-8">
               <style>
                  html,
                  body,
                  #wallet {
                     padding: 0px;
                     margin: 0px;
                     text-align: center;
                     overflow: hidden;
                     height: ${isAndroid ? '100vh' : null};
                     width: ${isAndroid ? '100vw' : null};
                  }
                  svg{
                     height: ${isAndroid ? '100vh' : '110vh'};
                     width: 100vw;
                  }
               </style>
            </head>
            <body>
              ${paperWallet}
            </body>
            </html>`;
        try {
            Navigation.mergeOptions('appStack', {
                topBar: {
                    barStyle: 'default',
                    visible: true,
                    animate: false,
                    buttonColor: '#ffffff',
                    drawBehind: true,
                    noBorder: true,
                    title: {
                        color: '#ffffff',
                    },
                    backButton: {
                        visible: false,
                    },
                    background: {
                        color: body.bg,
                        translucent: true,
                    },
                },
            });
            await RNPrint.print({ html: blankWalletHTML });
            this.onNextPress();
        } catch (err) {
            console.error(err); // eslint-disable-line no-console
        }
    }

    /**
     * Hides navigation bar
     *
     * @method componentDidAppear
     */
    componentDidAppear() {
        Navigation.mergeOptions('appStack', {
            topBar: {
                visible: false,
            },
        });
    }

    render() {
        const { t, theme } = this.props;
        const { hasPressedPrint } = this.state;

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                <View>
                    <View style={styles.topContainer}>
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={400}
                        >
                            <Header textColor={theme.body.color}>{t('printTemplateQuestion')}</Header>
                        </AnimatedComponent>
                    </View>
                    <View style={styles.midContainer}>
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={200}
                        >
                            <InfoBox>
                                {/* FIXME: Add illustration */}
                                <Text style={[styles.infoText, { color: theme.body.color }]}>
                                    {t('printTemplateInfo')}
                                </Text>
                                <Text style={[styles.infoTextBold, { color: theme.body.color }]}>
                                    {t('printTemplateWarning')}
                                </Text>
                            </InfoBox>
                        </AnimatedComponent>
                    </View>
                    <View style={styles.bottomContainer}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                            <DualFooterButtons
                                onLeftButtonPress={() => (hasPressedPrint ? this.onBackPress() : this.onNextPress())}
                                onRightButtonPress={() => this.onPrintPress()}
                                leftButtonText={hasPressedPrint ? t('back') : t('skip')}
                                rightButtonText={t('print')}
                            />
                        </AnimatedComponent>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    toggleModalActivity,
};

export default withNamespaces(['printBlankTemplate', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(PrintBlankTemplate),
);
