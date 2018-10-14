import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import ModalButtons from './ModalButtons';

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        width,
        height,
        justifyContent: 'center',
    },
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: Styling.borderRadius,
        borderWidth: 2,
        paddingVertical: height / 18,
        width: width / 1.15,
    },
    modalInfoText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        paddingBottom: height / 16,
    },
});

export class DeleteAccountModal extends PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        selectedAccountName: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Triggered when user presses no */
        onNoPress: PropTypes.func.isRequired,
        /** Triggered when user presses yes */
        onYesPress: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('LogoutConfirmationModal');
    }

    render() {
        const { t, theme: { body }, selectedAccountName } = this.props;
        const textColor = { color: body.color };

        return (
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { borderColor: body.color }, { backgroundColor: body.bg }]}>
                    <Text style={[styles.modalInfoText, { paddingBottom: height / 30 }, textColor]}>
                        {/*FIXME: localization*/}
                        {/*{t('areYouSure')}*/}
                        Are you sure you want to delete
                    </Text>
                    <Text style={[styles.modalInfoText, { paddingBottom: height / 16 }, textColor]}>
                        {selectedAccountName} ?
                    </Text>
                    <ModalButtons
                        onLeftButtonPress={() => this.props.onNoPress()}
                        onRightButtonPress={() => this.props.onYesPress()}
                        leftText={t('global:no')}
                        rightText={t('global:yes')}
                        buttonWidth={{ width: width / 3.2 }}
                        containerWidth={{ width: width / 1.4 }}
                    />
                </View>
            </View>
        );
    }
}

export default withNamespaces(['logoutConfirmationModal', 'global'])(DeleteAccountModal);
