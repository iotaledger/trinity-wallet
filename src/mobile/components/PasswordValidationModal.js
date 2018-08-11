import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableWithoutFeedback, View, Text, StyleSheet, Keyboard } from 'react-native';
import { translate } from 'react-i18next';
import GENERAL from '../theme/general';
import InfoBox from '../components/InfoBox';
import CustomTextInput from '../components/CustomTextInput';
import ModalButtons from '../containers/ModalButtons';
import StatefulDropdownAlert from '../containers/StatefulDropdownAlert';
import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    container: {
        width,
        height,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
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
                <View>
                    <View style={styles.container}>
                        <View style={{ backgroundColor: theme.body.bg }}>
                            <InfoBox
                                body={theme.body}
                                width={width / 1.15}
                                text={
                                    <View>
                                        <Text
                                            style={[
                                                styles.modalText,
                                                { color: theme.body.color },
                                                { paddingTop: height / 40 },
                                            ]}
                                        >
                                            {t('seedVault:enterPasswordExplanation')}
                                        </Text>
                                        <View style={{ paddingTop: height / 15, alignItems: 'center' }}>
                                            <CustomTextInput
                                                label={t('global:password')}
                                                onChangeText={(password) => this.setState({ password })}
                                                containerStyle={{ width: width / 1.3 }}
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
                                        <View style={{ paddingTop: height / 15, alignItems: 'center' }}>
                                            <ModalButtons
                                                onLeftButtonPress={() => this.props.hideModal()}
                                                onRightButtonPress={() => this.props.validatePassword(password)}
                                                leftText={t('global:back').toUpperCase()}
                                                rightText={t('okay').toUpperCase()}
                                                containerWidth={{ width: width / 1.3 }}
                                                buttonWidth={{ width: width / 3 }}
                                            />
                                        </View>
                                    </View>
                                }
                            />
                        </View>
                    </View>
                    <StatefulDropdownAlert backgroundColor={theme.body.bg} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['global'])(PasswordValidationModal);
