import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    ActivityIndicator,
    Image,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { width, height } from '../util/dimensions';
import Dropdown from './dropdown';
import { translate } from 'react-i18next';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    innerContainer: {
        flex: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 4,
        justifyContent: 'flex-start',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-end',
    },
    iconLeft: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    iconRight: {
        width: width / 28,
        height: width / 28,
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height / 40,
    },
    titleTextRight: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
    dropdownWidth: {
        width: width / 2,
    },
});

export class CurrencySelection extends Component {
    static propTypes = {
        isFetchingCurrencyData: PropTypes.bool.isRequired,
        hasErrorFetchingCurrencyData: PropTypes.bool.isRequired,
        getCurrencyData: PropTypes.func.isRequired,
        currency: PropTypes.string.isRequired,
        currencies: PropTypes.array.isRequired,
        backPress: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.string.isRequired,
        tickImagePath: PropTypes.number.isRequired,
        arrowLeftImagePath: PropTypes.number.isRequired,
    };

    componentWillReceiveProps(newProps) {
        const props = this.props;

        const wasFetchingCurrencyData = props.isFetchingCurrencyData && !newProps.isFetchingCurrencyData;
        const shouldNavigateBack = wasFetchingCurrencyData && !newProps.hasErrorFetchingCurrencyData;

        if (shouldNavigateBack) {
            props.backPress();
        }
    }

    getNewlySelectedValue() {
        if (this.dropdown) {
            return this.dropdown.getSelected();
        }

        return this.props.currency; // Just return currency selected in the store as a fallback
    }

    renderBackOption() {
        const props = this.props;

        return (
            <TouchableOpacity
                onPress={props.backPress}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.itemLeft}>
                    <Image source={props.arrowLeftImagePath} style={styles.iconLeft} />
                    <Text style={[styles.titleTextLeft, { color: props.secondaryBackgroundColor }]}>
                        {props.t('global:backLowercase')}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    renderSaveOption() {
        const props = this.props;

        return (
            <TouchableOpacity
                onPress={() => props.getCurrencyData(this.dropdown.getSelected(), true)}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.itemRight}>
                    <Text style={[styles.titleTextRight, { color: props.secondaryBackgroundColor }]}>
                        {props.t('global:save')}
                    </Text>
                    <Image source={props.tickImagePath} style={styles.iconRight} />
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        const { currency, currencies, t, secondaryBackgroundColor, negativeColor, isFetchingCurrencyData } = this.props;

        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if (this.dropdown) {
                        this.dropdown.closeDropdown();
                    }
                }}
            >
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 1.2 }} />
                        <Dropdown
                            onRef={c => {
                                this.dropdown = c;
                            }}
                            title={t('currency')}
                            options={currencies}
                            defaultOption={currency}
                            dropdownWidth={styles.dropdownWidth}
                            disableWhen={isFetchingCurrencyData}
                            background
                        />
                    </View>
                    {(isFetchingCurrencyData && (
                        <View style={styles.innerContainer}>
                            <ActivityIndicator
                                animating
                                style={styles.activityIndicator}
                                size="large"
                                color={negativeColor}
                            />
                        </View>
                    )) || <View style={styles.innerContainer} />}
                    <View style={styles.bottomContainer}>
                        {!isFetchingCurrencyData && this.renderBackOption()}
                        {!isFetchingCurrencyData && this.renderSaveOption()}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['currencySelection', 'global'])(CurrencySelection);
