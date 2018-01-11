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
import THEMES from '../theme/themes';

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
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 9,
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
    dropdownContainer: {
        flex: 0.2,
    },
    dropdownWidth: {
        width: width / 2,
    },
});

class CurrencySelection extends Component {
    static propTypes = {
        isFetchingCurrencyData: PropTypes.bool.isRequired,
        hasErrorFetchingCurrencyData: PropTypes.bool.isRequired,
        getCurrencyData: PropTypes.func.isRequired,
        currency: PropTypes.string.isRequired,
        currencies: PropTypes.array.isRequired,
        backPress: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        negativeColor: PropTypes.object.isRequired,
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

    renderBackOption() {
        const props = this.props;

        return (
            <TouchableOpacity onPress={props.backPress}>
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
            <TouchableOpacity onPress={() => props.getCurrencyData(this.dropdown.getSelected())}>
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
                        <View style={styles.dropdownContainer} />
                        <Dropdown
                            onRef={c => {
                                this.dropdown = c;
                            }}
                            title={t('currency')}
                            options={currencies}
                            defaultOption={currency}
                            dropdownWidth={styles.dropdownWidth}
                            disableWhen={isFetchingCurrencyData}
                        />
                    </View>
                    {isFetchingCurrencyData && (
                        <View style={styles.innerContainer}>
                            <Text style={[styles.infoText, { color: secondaryBackgroundColor }]}>
                                Fetching latest conversion rates for {this.dropdown.getSelected()}
                            </Text>
                            <ActivityIndicator
                                animating={true}
                                style={styles.activityIndicator}
                                size="large"
                                color={THEMES.getHSL(negativeColor)}
                            />
                        </View>
                    )}
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
