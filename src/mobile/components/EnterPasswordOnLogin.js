import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import RNExitApp from 'react-native-exit-app';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard, BackHandler } from 'react-native';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import OnboardingButtons from './OnboardingButtons';
import CustomTextInput from './CustomTextInput';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    topContainer: {
        flex: 2.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 3.6,
        width,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 8,
    },
    title: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    loginButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    loginText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
});

class EnterPasswordOnLogin extends Component {
    static propTypes = {
        theme: PropTypes.object.isRequired,
        password: PropTypes.string.isRequired,
    };

    componentDidMount() {
        BackHandler.addEventListener('loginBackPress', () => {
            RNExitApp.exitApp();
            return true;
        });
    }

    handleChangeText = (password) => this.props.setLoginPasswordField(password);

    handleLogin = () => {
        const { onLoginPress, password } = this.props;
        onLoginPress(password);
    };

    changeNode = () => {
        const { navigateToNodeSelection } = this.props;
        navigateToNodeSelection();
    };

    render() {
        const { t, theme, password } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <Icon name="iota" size={width / 8} color={theme.body.color} />
                    </View>
                    <View style={styles.midContainer}>
                        <CustomTextInput
                            label={t('global:password')}
                            onChangeText={this.handleChangeText}
                            containerStyle={{ width: width / 1.2 }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            secureTextEntry
                            onSubmitEditing={this.handleLogin}
                            theme={theme}
                            value={password}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <OnboardingButtons
                            onLeftButtonPress={this.changeNode}
                            onRightButtonPress={this.handleLogin}
                            leftText={t('setNode')}
                            rightText={t('login')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

EnterPasswordOnLogin.propTypes = {
    onLoginPress: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    navigateToNodeSelection: PropTypes.func.isRequired,
    setLoginPasswordField: PropTypes.func.isRequired,
};

export default translate(['login', 'global'])(EnterPasswordOnLogin);
