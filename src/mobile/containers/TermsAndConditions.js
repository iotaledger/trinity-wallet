import React, { Component } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import Markdown from 'react-native-markdown-renderer';
import {
    enTermsAndConditionsAndroid,
    enTermsAndConditionsIOS,
    deTermsAndConditionsAndroid,
    deTermsAndConditionsIOS,
} from 'iota-wallet-shared-modules/markdown';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { acceptTerms } from 'iota-wallet-shared-modules/actions/settings';
import Button from '../components/Button';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import DynamicStatusBar from '../components/DynamicStatusBar';
import i18next from '../i18next';
import { isAndroid } from '../utils/device';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: GENERAL.fontSize4,
        textAlign: 'center',
        paddingTop: height / 55,
    },
    titleContainer: {
        height: height / 8,
        width: width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        backgroundColor: '#ffffff',
        width,
        paddingHorizontal: width / 20,
        paddingVertical: height / 75,
    },
});

/** Welcome screen component */
class TermsAndConditions extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** User confirms that they agree to the terms and conditions */
        acceptTerms: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
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

    onNextPress() {
        const { theme } = this.props;
        this.props.acceptTerms();
        this.props.navigator.push({
            screen: 'privacyPolicy',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: 'white',
                drawUnderStatusBar: true,
                statusBarColor: theme.bar.bg,
            },
            animated: false,
        });
    }

    render() {
        const { t, theme: { primary, body, bar } } = this.props;
        const textColor = { color: bar.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={bar.bg} />
                <View style={[styles.titleContainer, { backgroundColor: bar.bg }]}>
                    <Text style={[styles.titleText, textColor]}>{t('termsAndConditions')}</Text>
                </View>
                <ScrollView
                    onScroll={(e) => {
                        let paddingToBottom = 20;
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
                </ScrollView>
                {this.state.hasReadTerms && (
                    <Button
                        onPress={() => this.onNextPress()}
                        style={{
                            wrapper: { backgroundColor: primary.color },
                            children: { color: primary.body },
                        }}
                    >
                        {t('accept')}
                    </Button>
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    acceptTerms,
};

export default translate('terms')(connect(mapStateToProps, mapDispatchToProps)(TermsAndConditions));
