import head from 'lodash/head';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import toUpper from 'lodash/toUpper';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { TouchableOpacity, StyleSheet, View, Text, Image } from 'react-native';
import navigator from 'libs/navigation';
import { selectPaymentCard } from 'shared-modules/actions/exchanges/MoonPay';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { getCustomerPaymentCards, getSelectedPaymentCard } from 'shared-modules/selectors/exchanges/MoonPay';
import WithUserActivity from 'ui/components/UserActivity';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import DropdownComponent from 'ui/components/Dropdown';
import { isIPhoneX } from 'libs/device';
import whiteSelectedCircleImagePath from 'shared-modules/images/dot-circle-white.png';
import blackSelectedCircleImagePath from 'shared-modules/images/dot-circle-black.png';
import whiteUnselectedCircleImagePath from 'shared-modules/images/circle-white.png';
import blackUnselectedCircleImagePath from 'shared-modules/images/circle-black.png';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
        width,
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    optionsContainer: {
        borderWidth: 1.5,
        borderRadius: Styling.borderRadius,
        width: Styling.contentWidth / 1.1,
    },
    rowContainer: {
        paddingHorizontal: width / 20,
        paddingVertical: height / 40,
        flexDirection: 'row',
    },
    image: {
        width: width / 20,
        height: width / 20,
    },
    dropdownSelectedOption: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize4,
    },
});

/** MoonPay select payment card component */
class SelectPaymentCard extends React.Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        selectedPaymentCard: PropTypes.object,
        /** @ignore */
        paymentCards: PropTypes.array.isRequired,
        /** @ignore */
        selectPaymentCard: PropTypes.func.isRequired,
    };

    static options = [
        {
            title: 'moonpay:storedPaymentCard',
            redirectUrl: 'reviewPurchase',
        },
        {
            title: 'moonpay:addACreditOrDebitCard',
            redirectUrl: 'userAdvancedInfo',
        },
    ];

    constructor(props) {
        super(props);

        this.state = {
            selectedPaymentCard: isEmpty(props.selectedPaymentCard)
                ? head(props.paymentCards)
                : props.selectedPaymentCard,
            selectedOptionIndex: 0,
        };
    }

    /**
     * Gets image path
     *
     * @method getImagePath
     *
     * @param {boolean} isSelected
     *
     * @returns {string}
     */
    getImagePath(isSelected) {
        const { isDark } = this.props.theme;

        const _selectedImagePath = isDark ? whiteSelectedCircleImagePath : blackSelectedCircleImagePath;
        const _unselectedImagePath = isDark ? whiteUnselectedCircleImagePath : blackUnselectedCircleImagePath;

        return isSelected ? _selectedImagePath : _unselectedImagePath;
    }

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    redirectToScreen(screen) {
        navigator.push(screen);
    }

    /**
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        navigator.pop(this.props.componentId);
    }

    /**
     * Formats card info for dropdown options
     *
     * @method formatCardInfo
     *
     * @param {object} cardInfo
     *
     * @returns {object}
     */
    formatCardInfo(cardInfo) {
        const { brand, id, lastDigits } = cardInfo;

        return {
            id,
            text: `${toUpper(brand)} **** **** **** ${lastDigits}`,
        };
    }

    renderOptionRow(rowIndex, isSelected, option, containerStyle) {
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <TouchableOpacity
                style={[styles.rowContainer, containerStyle]}
                onPress={() => this.setState({ selectedOptionIndex: rowIndex })}
            >
                <View>
                    <Image source={this.getImagePath(isSelected)} style={styles.image} />
                </View>
                <Text
                    style={[
                        styles.infoTextRegular,
                        textColor,
                        {
                            marginLeft: height / 70,
                        },
                    ]}
                >
                    {t(option.title)}
                </Text>
            </TouchableOpacity>
        );
    }

    renderOptions() {
        const { t, theme } = this.props;
        const { selectedOptionIndex } = this.state;

        const selectedPaymentCard = this.formatCardInfo(this.state.selectedPaymentCard);
        const paymentCards = map(this.props.paymentCards, this.formatCardInfo);
        const textColor = { color: theme.body.color };

        return map(SelectPaymentCard.options, (option, index) => {
            const isSelected = selectedOptionIndex === index;

            if (index) {
                return this.renderOptionRow(index, isSelected, option, {
                    backgroundColor: isSelected ? theme.input.bg : 'transparent',
                    borderBottomLeftRadius: Styling.borderRadius,
                    borderBottomRightRadius: Styling.borderRadius,
                });
            }

            return (
                <View
                    key={index}
                    style={[
                        styles.row,
                        {
                            borderTopLeftRadius: Styling.borderRadius,
                            borderTopRightRadius: Styling.borderRadius,
                            borderBottomWidth: 1.2,
                            borderBottomColor: theme.body.color,
                            backgroundColor: isSelected ? theme.input.bg : 'transparent',
                        },
                    ]}
                >
                    {this.renderOptionRow(index, isSelected, option)}
                    {isSelected && (
                        <View
                            style={[
                                styles.rowContainer,
                                {
                                    marginBottom: height / 80,
                                    flexDirection: 'column',
                                },
                            ]}
                        >
                            <DropdownComponent
                                dropdownTitleStyle={textColor}
                                dropdownSelectedOptionStyle={styles.dropdownSelectedOption}
                                dropdownWidth={{ width: isIPhoneX ? width / 1.4 : width / 1.6 }}
                                title={t('moonpay:card')}
                                onRef={(c) => {
                                    this.dropdown = c;
                                }}
                                value={selectedPaymentCard.text}
                                options={map(paymentCards, (card) => card.text)}
                                saveSelection={(paymentCardText) => {
                                    const paymentCard = find(paymentCards, { text: paymentCardText });

                                    this.setState({
                                        selectedPaymentCard: find(this.props.paymentCards, {
                                            id: paymentCard.id,
                                        }),
                                    });
                                }}
                            />
                        </View>
                    )}
                </View>
            );
        });
    }

    render() {
        const { t, theme } = this.props;

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                <View>
                    <View style={styles.topContainer}>
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={400}
                        >
                            <Header iconSize={width / 3} iconName="moonpay" textColor={theme.body.color} />
                        </AnimatedComponent>
                    </View>
                    <View style={styles.midContainer}>
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={320}
                        >
                            <InfoBox>
                                <Text style={[styles.infoText, { color: theme.body.color }]}>
                                    {t('moonpay:selectPaymentMethod')}
                                </Text>
                                <Text
                                    style={[
                                        styles.infoTextRegular,
                                        { paddingTop: height / 60, color: theme.body.color },
                                    ]}
                                >
                                    {t('moonpay:pleaseChooseFromTheOptionsBelow')}
                                </Text>
                            </InfoBox>
                        </AnimatedComponent>
                        <View style={{ flex: 0.6 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={240}
                        >
                            <View style={[styles.optionsContainer, { borderColor: theme.body.color }]}>
                                {this.renderOptions()}
                            </View>
                        </AnimatedComponent>
                        <View style={{ flex: 0.6 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                            <DualFooterButtons
                                onLeftButtonPress={() => this.goBack()}
                                onRightButtonPress={() => {
                                    this.props.selectPaymentCard(this.state.selectedPaymentCard.id);

                                    this.redirectToScreen(
                                        SelectPaymentCard.options[this.state.selectedOptionIndex].redirectUrl,
                                    );
                                }}
                                leftButtonText={t('global:goBack')}
                                rightButtonText={t('global:continue')}
                                leftButtonTestID="moonpay-back-to-home"
                                rightButtonTestID="moonpay-add-amount"
                            />
                        </AnimatedComponent>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    isUpdatingCustomer: state.exchanges.moonpay.isUpdatingCustomer,
    hasErrorUpdatingCustomer: state.exchanges.moonpay.hasErrorUpdatingCustomer,
    selectedPaymentCard: getSelectedPaymentCard(state),
    paymentCards: getCustomerPaymentCards(state),
});

const mapDispatchToProps = {
    selectPaymentCard,
};

export default WithUserActivity()(
    withTranslation()(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(SelectPaymentCard),
    ),
);
