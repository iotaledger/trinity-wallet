import React, { PureComponent } from 'react';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import timer from 'react-native-timer';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import ModalView from './ModalView';
import InfoBox from './InfoBox';
import Slider from './Slider';

const styles = StyleSheet.create({
    infoTextLarge: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        backgroundColor: 'transparent',
        width: width / 1.3,
    },
    infoTextNormal: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

export class RootDetectionModal extends PureComponent {
    static propTypes = {
        /** Hides active modal */
        hideModal: PropTypes.func.isRequired,
        /** Prints paper wallet */
        print: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            publicWifiConfirmed: false,
            publicPrinterConfirmed: false,
            confirmationText: props.t('wifiConfirmation'),
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('PrintModal');
    }

    componentWillUnmount() {
        timer.clearTimeout('delayTextChange');
    }

    onSwipeSuccess() {
        const { t } = this.props;
        if (!this.state.publicWifiConfirmed) {
            timer.setTimeout(
                'delayTextChange',
                () => this.setState({ confirmationText: t('printerConfirmation') }),
                1000,
            );
            return this.setState({ publicWifiConfirmed: true });
        }
        this.setState({ publicPrinterConfirmed: true });
    }

    onPrintPress() {
        this.props.print();
    }

    render() {
        const { t, theme: { body, input, dark, secondary, primary } } = this.props;
        const textColor = { color: body.color };

        return (
            <ModalView
                dualButtons
                onLeftButtonPress={() => this.props.hideModal()}
                onRightButtonPress={() => this.onPrintPress()}
                leftButtonText={t('global:back')}
                rightButtonText={t('print')}
                disableRightButton={!this.state.publicPrinterConfirmed}
            >
                <View style={{ flex: 0.3 }} />
                <Text style={[styles.infoTextLarge, textColor]}>{t('pleaseCheck')}</Text>
                <View style={{ flex: 0.1 }} />
                <InfoBox>
                    <Text style={[styles.infoTextNormal, textColor]}>{t('paperConvenience')} </Text>
                    <Text style={[styles.infoTextBold, textColor, { paddingTop: height / 60 }]}>
                        {t('publicInsecure')}
                    </Text>
                </InfoBox>
                <View style={{ flex: 0.1 }} />
                <Text style={[styles.infoTextBold, textColor]}>{this.state.confirmationText}</Text>
                <View style={{ flex: 0.1 }} />
                <Slider
                    filledColor={input.bg}
                    unfilledColor={dark.color}
                    textColor={body.color}
                    preSwipeColor={secondary.color}
                    postSwipeColor={primary.color}
                    onSwipeSuccess={() => {
                        this.onSwipeSuccess();
                    }}
                    sliderReset={this.state.publicWifiConfirmed}
                    numberOfSliders={2}
                />
                <View style={{ flex: 0.2 }} />
            </ModalView>
        );
    }
}

export default withNamespaces(['paperWallet', 'global'])(RootDetectionModal);
