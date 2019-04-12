import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, TouchableWithoutFeedback, Text, StyleSheet, Keyboard } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { isAndroid } from 'libs/device';
import CustomTextInput from './CustomTextInput';
import ModalView from './ModalView';

const styles = StyleSheet.create({
    questionText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
    },
    icon: {
        opacity: 0.6,
        paddingTop: height / 20,
        paddingBottom: height / 30,
        backgroundColor: 'transparent',
    },
});

export class PasswordValidationModal extends PureComponent {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Close active modal */
        hideModal: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Validate password provided by user */
        validatePassword: PropTypes.func.isRequired,
        /** Determines if modal is triggered from the wallet dashboard, in case the topBar should be displayed */
        isDashboard: PropTypes.bool,
    };

    static defaultProps = {
        isDashboard: false,
    };

    constructor() {
        super();
        this.state = {
            password: null,
        };
    }

    render() {
        const { t, theme, isDashboard } = this.props;
        const { password } = this.state;

        return (
            <TouchableWithoutFeedback style={{ flex: 1, width, height }} onPress={Keyboard.dismiss}>
                <View style={isAndroid ? { flex: 1, width, height } : null}>
                    <ModalView
                        displayTopBar={isDashboard}
                        dualButtons
                        onLeftButtonPress={() => this.props.hideModal()}
                        onRightButtonPress={() => this.props.validatePassword(password)}
                        leftButtonText={t('back')}
                        rightButtonText={t('okay')}
                    >
                        <Text style={[styles.questionText, { color: theme.body.color }]}>
                            {t('seedVault:enterKeyExplanation')}
                        </Text>
                        <Icon name="vault" size={width / 6} color={theme.body.color} style={styles.icon} />
                        <CustomTextInput
                            label={t('global:password')}
                            onValidTextChange={(password) => this.setState({ password })}
                            containerStyle={{ width: Styling.contentWidth }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            secureTextEntry
                            onSubmitEditing={() => this.props.validatePassword(password)}
                            theme={theme}
                            value={this.state.password}
                            isPasswordInput
                        />
                    </ModalView>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default withNamespaces(['global'])(PasswordValidationModal);
