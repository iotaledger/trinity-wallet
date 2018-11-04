import React, { PureComponent } from 'react';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
    },
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: Styling.borderRadius,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingTop: height / 20,
        paddingBottom: height / 25,
        width: Styling.contentWidth,
        paddingHorizontal: width / 20,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    regularText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
    },
    boldText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        textAlign: 'justify',
    },
});

class UsedAddressModal extends PureComponent {
    static propTypes = {
        /** Closes acive modal */
        hideModal: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Content text color */
        textColor: PropTypes.object.isRequired,
        /** Content border color */
        borderColor: PropTypes.object.isRequired,
        /** Theme body */
        body: PropTypes.object.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('UsedAddressModal');
    }

    render() {
        const { t, body, textColor, borderColor } = this.props;

        return (
            <TouchableOpacity onPress={() => this.props.hideModal()} style={styles.modalContainer}>
                <View style={{ width: Styling.contentWidth, alignItems: 'center', backgroundColor: body.bg }}>
                    <View style={[styles.modalContent, borderColor]}>
                        <View style={styles.textContainer}>
                            <Text style={[styles.regularText, textColor]}>{t('cantSpendFullBalanceQuestion')}</Text>
                            <Text style={[styles.boldText, textColor, { paddingTop: height / 25 }]}>
                                {t('spentAddressExplanation')}
                            </Text>
                            <Text style={[styles.boldText, textColor, { paddingTop: height / 60 }]}>
                                {t('discordInformation')}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

export default withNamespaces(['usedAddressModal', 'global'])(UsedAddressModal);
