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
        t: PropTypes.func.isRequired,
        primaryColor: PropTypes.string.isRequired,
        primaryBody: PropTypes.string.isRequired,
        receiveAddress: PropTypes.string.isRequired,
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        isGettingSensitiveInfoToGenerateAddress: PropTypes.bool.isRequired,
        onGeneratePress: PropTypes.func.isRequired,
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
                {receiveAddress === ' ' &&
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
                {receiveAddress.length > 1 && message.length === 0 && <View style={{ flex: 1 }} />}
            </View>
        );
    }
}

export default GenerateAddressButton;
