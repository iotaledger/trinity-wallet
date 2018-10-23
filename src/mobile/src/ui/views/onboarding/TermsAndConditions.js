import React, { Component } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Navigation } from 'react-native-navigation';
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
import SingleFooterButton from 'ui/components/SingleFooterButton';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import i18next from 'shared-modules/libs/i18next';
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
        const { theme: { bar } } = this.props;
        this.props.acceptTerms();
        Navigation.push('appStack', {
            component: {
                name: 'privacyPolicy',
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
                        backgroundColor: 'white',
                        orientation: ['portrait'],
                    },
                    topBar: {
                        visible: false,
                        drawBehind: true,
                        elevation: 0,
                    },
                    statusBar: {
                        drawBehind: true,
                        backgroundColor: bar.bg,
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
                    <Text style={[styles.titleText, textColor]}>{t('termsAndConditions')}</Text>
                </View>
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
                </ScrollView>
                {this.state.hasReadTerms && (
                    <View style={{ position: 'absolute', bottom: 0 }}>
                        <SingleFooterButton
                            onButtonPress={() => this.onNextPress()}
                            buttonStyle={{
                                wrapper: { backgroundColor: primary.color },
                                children: { color: primary.body },
                            }}
                            buttonText={t('accept')}
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
    acceptTerms,
};

export default withNamespaces('terms')(connect(mapStateToProps, mapDispatchToProps)(TermsAndConditions));
