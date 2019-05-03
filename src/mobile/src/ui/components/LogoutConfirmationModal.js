import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { withNamespaces } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { Styling } from 'ui/theme/general';
import { width } from 'libs/dimensions';
import { getAnimation } from 'shared-modules/animations';

import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
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
    animation: {
        width: width / 1.35,
        height: width / 1.35,
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
        /** @ignore */
        themeName: PropTypes.string.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('LogoutConfirmationModal');
    }

    render() {
        const {
            t,
            theme: { body },
            themeName,
        } = this.props;

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
                <LottieView source={getAnimation('logout', themeName)} style={styles.animation} autoPlay />
                <Text style={[styles.questionText, { color: body.color }]}>{t('areYouSure')}</Text>
            </ModalView>
        );
    }
}

export default WithLogout()(withNamespaces(['logoutConfirmationModal', 'global'])(LogoutConfirmationModal));
