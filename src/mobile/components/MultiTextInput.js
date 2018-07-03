import React, { Component } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
    setQrMessage,
    setQrAmount,
    setQrTag,
    setSelectedQrTab,
    setQrDenomination,
} from 'iota-wallet-shared-modules/actions/ui';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import AmountTextInput from './AmountTextInput';

const styles = StyleSheet.create({
    fieldContainer: {
        justifyContent: 'center',
        flex: 1,
    },
    labelContainer: {
        width: width / 5,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        height: height / 24,
    },
    label: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize2,
        marginLeft: 1,
        marginRight: width / 18,
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    messageInput: {
        fontSize: GENERAL.fontSize4,
        fontFamily: 'SourceSansPro-Light',
        flex: 1,
        margin: width / 28,
        justifyContent: 'flex-start',
    },
    tagInput: {
        fontSize: GENERAL.fontSize4,
        fontFamily: 'SourceSansPro-Light',
        marginHorizontal: width / 28,
        paddingTop: 0,
        paddingBottom: 0,
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    messageInputContainer: {
        flex: 1,
        borderRadius: GENERAL.borderRadiusSmall,
    },
});

class MultiTextInput extends Component {
    static propTypes = {
        theme: PropTypes.object.isRequired,
        setQrMessage: PropTypes.func.isRequired,
        setQrAmount: PropTypes.func.isRequired,
        setQrTag: PropTypes.func.isRequired,
        setQrDenomination: PropTypes.func.isRequired,
        setSelectedQrTab: PropTypes.func.isRequired,
        selectedTab: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
        message: PropTypes.string.isRequired,
        amount: PropTypes.string.isRequired,
        denomination: PropTypes.string.isRequired,
        multiplier: PropTypes.number.isRequired,
        generateAlert: PropTypes.func.isRequired,
    };

    /**
     *   Updates qrMessage in store (max length ).
     *   @method onMessageType
     **/
    onMessageType(message) {
        this.props.setQrMessage(message);
    }

    /**
     *   Updates qrTag in store (max length 27).
     *   @method onTagType
     **/
    onTagType(tag) {
        if (tag.length <= 27) {
            this.props.setQrTag(tag.toUpperCase());
        } else {
            this.props.generateAlert(
                // FIXME: Localize after beta
                'error',
                'Maximum length reached',
                'Tags can have a maximum length of 27 characters.',
            );
        }
    }

    /**
     *   Gets label style dependent on whether input is currently selected.
     *   @method getLabelStyle
     *   @returns {object}
     **/
    getLabelStyle(label) {
        const { theme, selectedTab } = this.props;
        const focusedFieldLabel = { color: theme.primary.color };
        const unfocusedFieldLabel = { color: theme.body.color };
        return label === selectedTab ? focusedFieldLabel : unfocusedFieldLabel;
    }

    render() {
        const { theme, t, message, amount, denomination, selectedTab, multiplier } = this.props;

        return (
            <View style={[styles.fieldContainer]}>
                <View style={styles.labels}>
                    <TouchableWithoutFeedback onPress={() => this.props.setSelectedQrTab('message')}>
                        <View style={styles.labelContainer}>
                            <Text style={[styles.label, this.getLabelStyle('message')]}>
                                {t('message').toUpperCase()}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={() => this.props.setSelectedQrTab('amount')}>
                        <View style={styles.labelContainer}>
                            <Text style={[styles.label, this.getLabelStyle('amount')]}>
                                {t('amount').toUpperCase()}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                    {/* FIXME: Disabled for beta
                    <TouchableWithoutFeedback onPress={() => this.props.setSelectedQrTab('tag')}>
                        <View style={styles.labelContainer}>
                            <Text style={[styles.label, this.getLabelStyle('tag')]}>{t('tag').toUpperCase()}</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    */}
                </View>
                <View style={styles.innerContainer}>
                    {selectedTab === 'message' && (
                        <View style={[styles.messageInputContainer, { backgroundColor: theme.input.bg }, { height }]}>
                            <TextInput
                                style={[styles.messageInput, { color: theme.input.color }]}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                onChangeText={(text) => this.onMessageType(text)}
                                selectionColor={theme.primary.color}
                                underlineColorAndroid="transparent"
                                multiline
                                value={message}
                            />
                        </View>
                    )}
                    {selectedTab === 'amount' && (
                        <AmountTextInput
                            label={null}
                            containerStyle={{ width: width / 1.25 }}
                            denomination={denomination}
                            amount={amount}
                            multiplier={multiplier}
                            setAmount={(text) => this.props.setQrAmount(text)}
                            setDenomination={(text) => this.props.setQrDenomination(text)}
                        />
                    )}
                    {/* FIXME: Disabled for beta
                    { selectedTab === 'tag' &&
                        <CustomTextInput
                            keyboardType="default"
                            label={null}
                            onChangeText={(text) => this.onTagType(text)}
                            containerStyle={{ width: width / 1.25 }}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            theme={theme}
                            value={tag}
                        />
                    }
                    */}
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    message: state.ui.qrMessage,
    amount: state.ui.qrAmount,
    tag: state.ui.qrTag,
    selectedTab: state.ui.selectedQrTab,
    denomination: state.ui.qrDenomination,
    currency: state.settings.currency,
});

const mapDispatchToProps = {
    setQrMessage,
    setQrAmount,
    setQrTag,
    setSelectedQrTab,
    setQrDenomination,
    generateAlert,
};

export default translate(['receive', 'global'])(connect(mapStateToProps, mapDispatchToProps)(MultiTextInput));
