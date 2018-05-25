import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import Pdf from 'react-native-pdf';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { acceptTerms } from 'iota-wallet-shared-modules/actions/settings';
import WithBackPressCloseApp from '../components/BackPressCloseApp';
import Button from '../components/Button';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import DynamicStatusBar from '../components/DynamicStatusBar';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    bottomContainer: {
        flex: 0.8,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize4,
        textAlign: 'center',
        paddingTop: height / 55,
    },
    pdf: {
        height: height,
        width: width,
    },
    titleContainer: {
        height: height / 8,
        width: width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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

    onNextPress() {
        const { theme } = this.props;
        this.props.acceptTerms();
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
        const source = require('iota-wallet-shared-modules/assets/terms.pdf');
        const textColor = { color: bar.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={[styles.titleContainer, { backgroundColor: bar.bg }]}>
                    <Text style={[styles.titleText, textColor]}>{t('termsAndConditions').toUpperCase()}</Text>
                </View>
                <Pdf source={source} style={styles.pdf} scale={1.3} enableAntialiasing />
                <Button
                    onPress={() => this.onNextPress()}
                    style={{
                        wrapper: { backgroundColor: primary.color },
                        children: { color: primary.body },
                    }}
                >
                    {t('agree')}
                </Button>
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

export default WithBackPressCloseApp()(
    translate('terms')(connect(mapStateToProps, mapDispatchToProps)(TermsAndConditions)),
);
