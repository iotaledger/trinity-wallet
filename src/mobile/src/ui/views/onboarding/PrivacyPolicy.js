import React, { Component } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-renderer';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { navigator } from 'libs/navigation';
import { acceptPrivacy } from 'shared-modules/actions/settings';
import {
    enPrivacyPolicyAndroid,
    enPrivacyPolicyIOS,
    dePrivacyPolicyAndroid,
    dePrivacyPolicyIOS,
} from 'shared-modules/markdown';
import i18next from 'shared-modules/libs/i18next';
import { getThemeFromState } from 'shared-modules/selectors/global';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { isAndroid, isIPhoneX } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        height,
    },
    titleText: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: Styling.fontSize4,
        textAlign: 'center',
    },
    titleContainer: {
        height: height / 8,
        width: width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: isIPhoneX ? 0 : 10,
    },
    scrollView: {
        backgroundColor: '#ffffff',
        width,
        paddingHorizontal: width / 20,
        paddingVertical: height / 75,
        height: height,
    },
});

/** Welcome screen component */
class PrivacyPolicy extends Component {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        acceptPrivacy: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    static isCurrentLanguageGerman() {
        return i18next.language === 'de';
    }

    static getPrivacyPolicy() {
        const isCurrentLanguageGerman = PrivacyPolicy.isCurrentLanguageGerman();

        if (isCurrentLanguageGerman && isAndroid) {
            return dePrivacyPolicyAndroid;
        } else if (isCurrentLanguageGerman && !isAndroid) {
            return dePrivacyPolicyIOS;
        } else if (!isCurrentLanguageGerman && isAndroid) {
            return enPrivacyPolicyAndroid;
        } else if (!isCurrentLanguageGerman && !isAndroid) {
            return enPrivacyPolicyIOS;
        }
    }

    constructor() {
        super();
        this.state = { hasReadPrivacyPolicy: false };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('PrivacyPolicy');
    }

    onNextPress() {
        this.props.acceptPrivacy();
        navigator.push('walletSetup');
    }

    render() {
        const { t, theme: { primary, bar } } = this.props;
        const textColor = { color: bar.color };

        return (
            <View style={[styles.container, { backgroundColor: bar.bg }]}>
                <AnimatedComponent
                    animationInType={['slideInRight', 'fadeIn']}
                    animationOutType={['slideOutLeft', 'fadeOut']}
                    delay={400}
                    style={[styles.titleContainer, { backgroundColor: bar.bg }]}
                >
                    <Text style={[styles.titleText, textColor]}>{t('privacyPolicy')}</Text>
                </AnimatedComponent>
                <AnimatedComponent
                    animationInType={['slideInRight', 'fadeIn']}
                    animationOutType={['slideOutLeft', 'fadeOut']}
                    delay={200}
                >
                    <ScrollView
                        onScroll={(e) => {
                            let paddingToBottom = height / 35;
                            paddingToBottom += e.nativeEvent.layoutMeasurement.height;

                            if (e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom) {
                                if (!this.state.hasReadPrivacyPolicy) {
                                    this.setState({ hasReadPrivacyPolicy: true });
                                }
                            }
                        }}
                        scrollEventThrottle={400}
                        style={styles.scrollView}
                    >
                        <Markdown styles={{ text: { fontFamily: 'SourceSansPro-Regular' } }}>
                            {PrivacyPolicy.getPrivacyPolicy()}
                        </Markdown>
                        <View style={{ height: height / 8 }} />
                    </ScrollView>
                </AnimatedComponent>
                {this.state.hasReadPrivacyPolicy && (
                    <View style={{ position: 'absolute', bottom: 0 }}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                            <SingleFooterButton
                                onButtonPress={() => this.onNextPress()}
                                buttonStyle={{
                                    wrapper: { backgroundColor: primary.color },
                                    children: { color: primary.body },
                                }}
                                buttonText={t('agree')}
                            />
                        </AnimatedComponent>
                    </View>
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    acceptPrivacy,
};

export default withNamespaces('privacyPolicy')(connect(mapStateToProps, mapDispatchToProps)(PrivacyPolicy));
