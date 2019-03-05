import React, { Component } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { navigator } from 'libs/navigation';
import PropTypes from 'prop-types';
import Markdown from 'react-native-markdown-renderer';
import {
    enTermsAndConditionsAndroid,
    enTermsAndConditionsIOS,
    deTermsAndConditionsAndroid,
    deTermsAndConditionsIOS,
} from 'shared-modules/markdown';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { acceptTerms } from 'shared-modules/actions/settings';
import { getThemeFromState } from 'shared-modules/selectors/global';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import i18next from 'shared-modules/libs/i18next';
import { isAndroid, isIPhoneX } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        height,
        flex: 1,
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
class TermsAndConditions extends Component {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        acceptTerms: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    static isCurrentLanguageGerman() {
        return i18next.language === 'de';
    }

    static getTermsAndConditions() {
        const isCurrentLanguageGerman = TermsAndConditions.isCurrentLanguageGerman();

        if (isCurrentLanguageGerman && isAndroid) {
            return deTermsAndConditionsAndroid;
        } else if (isCurrentLanguageGerman && !isAndroid) {
            return deTermsAndConditionsIOS;
        } else if (!isCurrentLanguageGerman && isAndroid) {
            return enTermsAndConditionsAndroid;
        } else if (!isCurrentLanguageGerman && !isAndroid) {
            return enTermsAndConditionsIOS;
        }
    }

    constructor() {
        super();

        this.state = { hasReadTerms: false };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('TermsAndConditions');
    }

    /**
     * Navigates to privacy policy screen
     * @method onNextPress
     */
    onNextPress() {
        this.props.acceptTerms();
        navigator.push('privacyPolicy');
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
                    <Text style={[styles.titleText, textColor]}>{t('termsAndConditions')}</Text>
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
                                if (!this.state.hasReadTerms) {
                                    this.setState({ hasReadTerms: true });
                                }
                            }
                        }}
                        scrollEventThrottle={400}
                        style={styles.scrollView}
                    >
                        <Markdown styles={{ text: { fontFamily: 'SourceSansPro-Regular' } }}>
                            {TermsAndConditions.getTermsAndConditions()}
                        </Markdown>
                        <View style={{ height: height / 9 }} />
                    </ScrollView>
                </AnimatedComponent>
                {this.state.hasReadTerms && (
                    <View style={{ position: 'absolute', bottom: 0 }}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                            <SingleFooterButton
                                onButtonPress={() => this.onNextPress()}
                                buttonStyle={{
                                    wrapper: { backgroundColor: primary.color },
                                    children: { color: primary.body },
                                }}
                                buttonText={t('accept')}
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
    acceptTerms,
};

export default withNamespaces('terms')(connect(mapStateToProps, mapDispatchToProps)(TermsAndConditions));
