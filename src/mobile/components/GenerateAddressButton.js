import React, { PureComponent } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import CtaButton from '../components/CtaButton';
import { height } from '../utils/dimensions';

const styles = StyleSheet.create({
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 5,
    },
});

class GenerateAddressButton extends PureComponent {
    static propTypes = {
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Button background and border color */
        primaryColor: PropTypes.string.isRequired,
        /** Button text color */
        primaryBody: PropTypes.string.isRequired,
        /** Receive address text */
        receiveAddress: PropTypes.string.isRequired,
        /** Receive address generation state */
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        /** Keychain access state */
        isGettingSensitiveInfoToGenerateAddress: PropTypes.bool.isRequired,
        /** Press event callback function */
        onGeneratePress: PropTypes.func.isRequired,
        /** Message text */
        message: PropTypes.string.isRequired,
    };

    render() {
        const {
            t,
            primaryColor,
            primaryBody,
            receiveAddress,
            message,
            isGeneratingReceiveAddress,
            isGettingSensitiveInfoToGenerateAddress,
        } = this.props;

        return (
            <View>
                {receiveAddress === '' &&
                    (!isGeneratingReceiveAddress && !isGettingSensitiveInfoToGenerateAddress) && (
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <CtaButton
                                ctaColor={primaryColor}
                                ctaBorderColor={primaryColor}
                                secondaryCtaColor={primaryBody}
                                text={t('generateNewAddress')}
                                onPress={() => {
                                    if (!isGeneratingReceiveAddress) {
                                        this.props.onGeneratePress();
                                    }
                                }}
                            />
                        </View>
                    )}
                {(isGettingSensitiveInfoToGenerateAddress || isGeneratingReceiveAddress) && (
                    <View style={{ flex: 1 }}>
                        <ActivityIndicator
                            animating={isGeneratingReceiveAddress || isGettingSensitiveInfoToGenerateAddress}
                            style={styles.activityIndicator}
                            size="large"
                            color={primaryColor}
                        />
                    </View>
                )}
                {receiveAddress.length > 0 && message.length === 0 && <View style={{ flex: 1 }} />}
            </View>
        );
    }
}

export default GenerateAddressButton;
