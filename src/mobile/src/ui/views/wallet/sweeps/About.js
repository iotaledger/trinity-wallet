import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import navigator from 'libs/navigation';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import Header from 'ui/components/Header';
import InfoBox from 'ui/components/InfoBox';
import { Styling } from 'ui/theme/general';
import { height } from 'libs/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topWrapper: {
        flex: 0.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midWrapper: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomWrapper: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontSize: Styling.fontSize3,
        fontFamily: 'SourceSansPro-Light',
        backgroundColor: 'transparent',
        paddingBottom: height / 30,
        textAlign: 'center',
    },
    infoTextBold: {
        fontSize: Styling.fontSize3,
        fontFamily: 'SourceSansPro-Regular',
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

class About extends React.PureComponent {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    render() {
        const {
            t,
            theme: { body },
        } = this.props;

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topWrapper}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={400}
                    >
                        <Header textColor={body.color}>{t('lockedFundsRecovery')}</Header>
                    </AnimatedComponent>
                </View>
                <View style={styles.midWrapper}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={200}
                    >
                        <InfoBox>
                            <Text style={[styles.infoText, { color: body.color }]}>
                                {t('sweeps:lockedFundsRecoveryExplanation')}
                            </Text>
                            <Text style={[styles.infoText, { color: body.color }]}>
                                {t('sweeps:lockedFundsToolExplanation')}
                            </Text>
                            <Text style={[styles.infoTextBold, { color: body.color }]}>
                                {t('sweeps:lockedFundsOwnRiskExplanation')}
                            </Text>
                        </InfoBox>
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomWrapper}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                        <DualFooterButtons
                            onLeftButtonPress={() => navigator.pop(this.props.componentId)}
                            onRightButtonPress={() => navigator.push('sweepsTransferFunds')}
                            leftButtonText={t('global:cancel')}
                            rightButtonText={t('global:accept')}
                        />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    wallet: state.wallet,
    additionalAccountName: state.accounts.accountInfoDuringSetup.name,
});

export default connect(mapStateToProps)(withTranslation(['sweeps', 'global'])(About));
