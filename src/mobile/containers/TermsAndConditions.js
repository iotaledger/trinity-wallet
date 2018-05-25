import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import Pdf from 'react-native-pdf';
import { connect } from 'react-redux';
import { acceptTerms } from 'iota-wallet-shared-modules/actions/settings';
import WithBackPressCloseApp from '../components/BackPressCloseApp';
import Button from '../components/Button';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
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
        marginLeft: width / 20,
    },
    pdf: {
        height: height / 1.5,
        width: width / 1.1,
        paddingBottom: height / 30,
    },
    titleContainer: {
        height: height / 8,
        width: width / 1.1,
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
        const { theme: { primary, body, bar } } = this.props;
        const source = require('iota-wallet-shared-modules/assets/terms.pdf');
        const textColor = { color: bar.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topContainer}>
                    <View style={{ height: height / 10 }} />
                    <View style={[styles.titleContainer, { backgroundColor: bar.bg }]}>
                        <Icon name="iota" size={width / 14} color={bar.color} />
                        <Text style={[styles.titleText, textColor]}>Terms and Conditions</Text>
                    </View>
                    <Pdf source={source} style={styles.pdf} scale={1.3} enableAntialiasing />
                    <View style={{ height: height / 24 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <Button
                        onPress={() => this.onNextPress()}
                        style={{
                            wrapper: { backgroundColor: primary.color },
                            children: { color: primary.body },
                        }}
                    >
                        I agree
                    </Button>
                </View>
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

export default WithBackPressCloseApp()(connect(mapStateToProps, mapDispatchToProps)(TermsAndConditions));
