import React, { Component } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import Markdown from 'react-native-markdown-renderer';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { Navigation } from 'react-native-navigation';
import { acceptPrivacy } from 'shared-modules/actions/settings';
import {
    enPrivacyPolicyAndroid,
    enPrivacyPolicyIOS,
    dePrivacyPolicyAndroid,
    dePrivacyPolicyIOS,
} from 'shared-modules/markdown';
import i18next from 'shared-modules/libs/i18next';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: Styling.fontSize4,
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
        const { theme: { body } } = this.props;
        this.props.acceptPrivacy();
        Navigation.push('appStack', {
            component: {
                name: 'walletSetup',
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

    render() {
        const { t, theme: { primary, body, bar } } = this.props;
        const textColor = { color: bar.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={[styles.titleContainer, { backgroundColor: bar.bg }]}>
                    <Text style={[styles.titleText, textColor]}>{t('privacyPolicy')}</Text>
                </View>
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
                </ScrollView>
                {this.state.hasReadPrivacyPolicy && (
                    <View style={{ position: 'absolute', bottom: 0 }}>
                        <SingleFooterButton
                            onButtonPress={() => this.onNextPress()}
                            buttonStyle={{
                                wrapper: { backgroundColor: primary.color },
                                children: { color: primary.body },
                            }}
                            buttonText={t('agree')}
                        />
                    </View>
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

export default withNamespaces('privacyPolicy')(connect(mapStateToProps, mapDispatchToProps)(PrivacyPolicy));
