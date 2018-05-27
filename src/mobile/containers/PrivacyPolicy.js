import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import Pdf from 'react-native-pdf';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { acceptPrivacy } from 'iota-wallet-shared-modules/actions/settings';
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
        const source = require('iota-wallet-shared-modules/assets/terms.pdf');
        const textColor = { color: bar.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={bar.bg} />
                <View style={[styles.titleContainer, { backgroundColor: bar.bg }]}>
                    <Text style={[styles.titleText, textColor]}>{t('privacyPolicy').toUpperCase()}</Text>
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
    acceptPrivacy,
};

export default WithBackPressCloseApp()(
    translate('privacyPolicy')(connect(mapStateToProps, mapDispatchToProps)(PrivacyPolicy)),
);
