import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import DualFooterButtons from './DualFooterButtons';

const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        width,
        height,
        justifyContent: 'flex-end',
    },
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        width,
        height: height - Styling.topbarHeight,
    },
    questionText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize5,
        paddingBottom: height / 11,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('LogoutConfirmationModal');
    }

    render() {
        const { t, theme: { body } } = this.props;

        return (
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: body.bg }]}>
                    <View style={styles.textContainer}>
                        <Text style={[styles.questionText, { color: body.color }]}>{t('logoutConfirmation')}</Text>
                    </View>
                    <DualFooterButtons
                        onLeftButtonPress={() => this.props.hideModal()}
                        onRightButtonPress={() => this.props.logout()}
                        leftButtonText={t('no').toUpperCase()}
                        rightButtonText={t('yes').toUpperCase()}
                    />
                </View>
            </View>
        );
    }
}

export default withNamespaces(['logoutConfirmationModal', 'global'])(LogoutConfirmationModal);
