import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Styling } from 'ui/theme/general';
import { withNamespaces } from 'react-i18next';
import { width, height } from 'libs/dimensions';
import InfoBox from './InfoBox';

const styles = StyleSheet.create({
    okButton: {
        borderWidth: 1.2,
        borderRadius: Styling.borderRadius,
        width: width / 2.7,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    okText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    modalText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    modalTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
});

export class ChecksumModal extends PureComponent {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Close active modal */
        closeModal: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    render() {
        const { t, theme: { body, primary } } = this.props;

        return (
            <View style={{ backgroundColor: body.bg }}>
                <InfoBox
                    body={body}
                    width={Styling.contentWidth}
                    text={
                        <View>
                            <Text style={[styles.modalTextBold, { color: body.color }, { paddingTop: height / 40 }]}>
                                {t('saveYourSeed:whatIsChecksum')}
                            </Text>
                            <Text style={[styles.modalText, { color: body.color }, { paddingTop: height / 60 }]}>
                                {t('saveYourSeed:checksumExplanation')}
                            </Text>
                            <View style={{ paddingTop: height / 20, alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => this.props.closeModal()}>
                                    <View style={[styles.okButton, { borderColor: primary.color }]}>
                                        <Text style={[styles.okText, { color: primary.color }]}>
                                            {t('global:okay')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                />
            </View>
        );
    }
}

export default withNamespaces(['logoutConfirmationModal', 'global'])(ChecksumModal);
