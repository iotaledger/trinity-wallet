import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { formatTime, convertUnixTimeToJSDate } from 'iota-wallet-shared-modules/libs/dateUtils';
import Modal from 'react-native-modal';
import HistoryModalContent from '../components/historyModalContent';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: height / 60,
        paddingHorizontal: width / 30,
        borderWidth: 0.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 1.2,
        height: height / 10,
        justifyContent: 'center',
        marginBottom: height / 60,
    },
    topWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    innerWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    messageOuterWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    messageInnerWrapper: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    timeWrapper: {
        flex: 1,
        alignItems: 'flex-end',
    },
    statusWrapper: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
    statusText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
    },
    message: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 31.8,
    },
    messageTitle: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Bold',
        fontSize: width / 31.8,
        paddingRight: width / 70,
    },
    confirmationStatus: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
    },
    timestamp: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 31.8,
    },
    modal: {
        alignItems: 'center',
    },
});

export default class TransactionRow extends PureComponent {
    static propTypes = {
        generateAlert: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        rebroadcast: PropTypes.func.isRequired,
        promote: PropTypes.func.isRequired,
        status: PropTypes.string.isRequired,
        confirmation: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
        unit: PropTypes.string.isRequired,
        time: PropTypes.number.isRequired,
        message: PropTypes.string,
        bundle: PropTypes.string.isRequired,
        disableWhen: PropTypes.bool.isRequired,
        addresses: PropTypes.arrayOf(
            PropTypes.shape({
                address: PropTypes.string.isRequired,
                value: PropTypes.number.isRequired,
                unit: PropTypes.string.isRequired,
            }),
        ).isRequired,
        style: PropTypes.shape({
            titleColor: PropTypes.string.isRequired,
            containerBorderColor: PropTypes.shape({ borderColor: PropTypes.string.isRequired }).isRequired,
            containerBackgroundColor: PropTypes.shape({ backgroundColor: PropTypes.string.isRequired }).isRequired,
            confirmationStatusColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            defaultTextColor: PropTypes.shape({ color: PropTypes.string.isRequired }).isRequired,
            backgroundColor: PropTypes.string.isRequired,
            borderColor: PropTypes.shape({ borderColor: PropTypes.string.isRequired }).isRequired,
            barColor: PropTypes.string.isRequired,
            barBg: PropTypes.string.isRequired,
            buttonsOpacity: PropTypes.shape({ opacity: PropTypes.number.isRequired }).isRequired,
        }).isRequired,
    };

    static defaultProps = {
        message: 'Empty',
    };

    constructor() {
        super();

        this.state = { isModalActive: false };

        this.toggleModal = this.toggleModal.bind(this);
    }

    getModalProps() {
        const props = this.props;

        return { ...props, onPress: this.toggleModal };
    }

    toggleModal() {
        this.setState({ isModalActive: !this.state.isModalActive });
    }

    render() {
        const { status, confirmation, value, unit, time, message, t, style } = this.props;
        const { isModalActive } = this.state;

        return (
            <TouchableOpacity onPress={this.toggleModal}>
                <View style={styles.topWrapper}>
                    <View style={[styles.container, style.containerBorderColor, style.containerBackgroundColor]}>
                        <View style={styles.innerWrapper}>
                            <View style={styles.statusWrapper}>
                                <Text style={[styles.statusText, { color: style.titleColor }]}>
                                    {status} {value} {unit}
                                </Text>
                            </View>
                            <Text style={[styles.confirmationStatus, style.confirmationStatusColor]}>
                                {confirmation}
                            </Text>
                        </View>
                        <View style={styles.messageOuterWrapper}>
                            <View style={styles.messageInnerWrapper}>
                                <Text style={[styles.messageTitle, style.defaultTextColor]}>{t('send:message')}:</Text>
                                <Text style={[styles.message, style.defaultTextColor]} numberOfLines={1}>
                                    {message}
                                </Text>
                            </View>
                            <View style={styles.timeWrapper}>
                                <Text style={[styles.timestamp, style.defaultTextColor]}>
                                    {formatTime(convertUnixTimeToJSDate(time))}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Modal
                        animationIn="bounceInUp"
                        animationOut="bounceOut"
                        animationInTiming={1000}
                        animationOutTiming={200}
                        backdropTransitionInTiming={500}
                        backdropTransitionOutTiming={200}
                        backdropColor={style.backgroundColor}
                        backdropOpacity={0.6}
                        style={styles.modal}
                        isVisible={isModalActive}
                        onBackButtonPress={this.toggleModal}
                        onBackdropPress={this.toggleModal}
                        useNativeDriver
                        hideModalContentWhileAnimating
                    >
                        <HistoryModalContent {...this.getModalProps()} />
                    </Modal>
                </View>
            </TouchableOpacity>
        );
    }
}
