import React, { Component } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-renderer';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { acceptPrivacy } from 'iota-wallet-shared-modules/actions/settings';
import {
    enPrivacyPolicyAndroid,
    enPrivacyPolicyIOS,
    dePrivacyPolicyAndroid,
    dePrivacyPolicyIOS,
} from 'iota-wallet-shared-modules/markdown';
import i18next from '../i18next';
import Button from '../components/Button';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import DynamicStatusBar from '../components/DynamicStatusBar';
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
    pdf: {
        flex: 1,
        height: height - height / 8 - height / 11,
        width: width,
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
class PrivacyPolicy extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** User confirms that they agree to the privacy policy */
        acceptPrivacy: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
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
        const { theme } = this.props;
        this.props.acceptPrivacy();
        this.props.navigator.push({
            screen: 'welcome',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: theme.body.bg,
                drawUnderStatusBar: true,
                statusBarColor: theme.body.bg,
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
                    <Text style={[styles.titleText, textColor]}>{t('privacyPolicy')}</Text>
                </View>
                <ScrollView
                    onScroll={(e) => {
                        let paddingToBottom = 20;
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
                </ScrollView>
                {this.state.hasReadPrivacyPolicy && (
                    <Button
                        onPress={() => this.onNextPress()}
                        style={{
                            wrapper: { backgroundColor: primary.color },
                            children: { color: primary.body },
                        }}
                    >
                        {t('agree')}
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
    acceptPrivacy,
};

export default translate('privacyPolicy')(connect(mapStateToProps, mapDispatchToProps)(PrivacyPolicy));
