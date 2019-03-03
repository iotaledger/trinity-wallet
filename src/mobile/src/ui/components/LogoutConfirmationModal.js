import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { Icon } from 'ui/theme/icons';
import WithLogout from 'ui/components/Logout';
import ModalView from './ModalView';

const styles = StyleSheet.create({
    infoText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        width: width / 1.8,
        textAlign: 'center',
    },
    questionText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize5,
    },
    icon: {
        opacity: 0.6,
        paddingVertical: height / 30,
        backgroundColor: 'transparent',
    },
});

export class LogoutConfirmationModal extends PureComponent {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Hide active modal */
        hideModal: PropTypes.func.isRequired,
        /** Clears temporary wallet data and navigates to login screen */
        logout: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('LogoutConfirmationModal');
    }

    render() {
        const { t, theme: { body } } = this.props;

        return (
            <ModalView
                displayTopBar
                dualButtons
                onLeftButtonPress={this.props.hideModal}
                onRightButtonPress={this.props.logout}
                leftButtonText={t('no')}
                rightButtonText={t('yes')}
            >
                <Text style={[styles.infoText, { color: body.color }]}>{t('aboutToLogOut')}</Text>
                <Icon name="logout" size={width / 5} color={body.color} style={styles.icon} />
                <Text style={[styles.questionText, { color: body.color }]}>{t('areYouSure')}</Text>
            </ModalView>
        );
    }
}

export default WithLogout()(withNamespaces(['logoutConfirmationModal', 'global'])(LogoutConfirmationModal));
