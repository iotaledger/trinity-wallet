import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon } from '../theme/icons.js';
import GENERAL from '../theme/general';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    nextButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    nextText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    infoTextContainer: {
        paddingHorizontal: width / 15,
        alignItems: 'center',
    },
    infoTextLight: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center',
    },
    infoTextRegular: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center',
    },
});

class Welcome extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
    };

    onNextPress() {
        const { body } = this.props;
        this.props.navigator.push({
            screen: 'walletSetup',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    render() {
        const { t, body, primary } = this.props;
        const textColor = { color: body.color };
        return (
            <View style={[ styles.container, {backgroundColor: body.bg} ]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topContainer}>
                    <Icon
                        name='iota'
                        size={width / 8}
                        color={body.color}
                    />
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.infoTextContainer}>
                        <Text style={[ styles.infoTextLight, textColor ]}>{t('thankYou')}</Text>
                        <Text style={[ styles.infoTextLight, textColor ]}>{t('weWillSpend')}</Text>
                        <Text style={[ styles.infoTextRegular, textColor ]}>{t('reminder')}</Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.onNextPress()} testID="welcome-next">
                        <View style={[ styles.nextButton, { borderColor: primary.color }]}>
                            <Text style={[ styles.nextText, { color: primary.color }]}>{t('global:next')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    primary: state.settings.theme.primary,
    body: state.settings.theme.body,
});

export default translate(['welcome', 'global'])(connect(mapStateToProps, null)(Welcome));
