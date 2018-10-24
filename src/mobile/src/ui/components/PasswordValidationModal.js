import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Keyboard } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import CustomTextInput from './CustomTextInput';
import DualFooterButtons from './DualFooterButtons';

const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width,
        height,
    },
    modalContent: {
        borderRadius: Styling.borderRadius,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: height - Styling.topbarHeight,
        width,
    },
    textContainer: {
        width: width - width / 10,
        paddingBottom: height / 11,
        alignItems: 'center',
    },
    modalText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        textAlign: 'left',
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
    };

    constructor() {
        super();
        this.state = {
            password: '',
        };
    }

    render() {
        const { t, theme } = this.props;
        const { password } = this.state;

        return (
            <TouchableWithoutFeedback style={{ flex: 1, width }} onPress={Keyboard.dismiss}>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: theme.body.bg }]}>
                        <View style={{ flex: 1 }} />
                        <View style={styles.textContainer}>
                            <Text style={[styles.modalText, { color: theme.body.color }, { paddingTop: height / 40 }]}>
                                {t('seedVault:enterPasswordExplanation')}
                            </Text>
                            <View style={{ paddingTop: height / 15, alignItems: 'center' }}>
                                <CustomTextInput
                                    label={t('global:password')}
                                    onChangeText={(password) => this.setState({ password })}
                                    containerStyle={{ width: Styling.contentWidth }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    secureTextEntry
                                    onSubmitEditing={() => this.props.validatePassword(password)}
                                    theme={theme}
                                    value={this.state.password}
                                />
                            </View>
                        </View>
                        <View style={{ flex: 1 }} />
                        <DualFooterButtons
                            onLeftButtonPress={() => this.props.hideModal()}
                            onRightButtonPress={() => this.props.validatePassword(password)}
                            leftButtonText={t('back').toUpperCase()}
                            rightButtonText={t('okay').toUpperCase()}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default withNamespaces(['global'])(PasswordValidationModal);
