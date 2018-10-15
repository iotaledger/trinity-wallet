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
        width: Styling.contentWidth,
    },
    questionText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        paddingBottom: height / 16,
    },
});

export class LogoutConfirmationModal extends PureComponent {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Hide active modal */
        hideModal: PropTypes.func.isRequired,
        /** Log out from wallet */
        logout: PropTypes.func.isRequired,
        /** Modal background color */
        backgroundColor: PropTypes.object.isRequired,
        /** Modal text color */
        textColor: PropTypes.object.isRequired,
        /** Modal border color */
        borderColor: PropTypes.object.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('LogoutConfirmationModal');
    }

    render() {
        const { t, backgroundColor, textColor, borderColor } = this.props;

        return (
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, borderColor, backgroundColor]}>
                    <Text style={[styles.questionText, textColor]}>{t('logoutConfirmation')}</Text>
                    <ModalButtons
                        onLeftButtonPress={() => this.props.hideModal()}
                        onRightButtonPress={() => this.props.logout()}
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

export default withNamespaces(['logoutConfirmationModal', 'global'])(LogoutConfirmationModal);
