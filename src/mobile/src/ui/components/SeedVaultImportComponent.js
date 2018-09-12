import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DocumentPicker } from 'react-native-document-picker';
import { generateAlert } from 'shared-modules/actions/alerts';
import nodejs from 'nodejs-mobile-react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { translate } from 'react-i18next';
import { width } from 'libs/dimensions';
import GENERAL from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';
import { isAndroid } from 'libs/device';

const styles = StyleSheet.create({
    infoText: {
        fontSize: GENERAL.fontSize3,
        fontFamily: 'SourceSansPro-Regular',
        paddingLeft: width / 70,
    },
});

export class SeedVaultImportComponent extends Component {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** Opens password validation modal on SeedVault import */
        openPasswordValidationModal: PropTypes.func.isRequired,
        /** Triggered when seed is obtained from SeedVault */
        onSeedImport: PropTypes.func.isRequired,
        /** Returns the rendered component instance
         * @param {object} instance - Component instance
         */
        onRef: PropTypes.func.isRequired,
    };

    componentWillMount() {
        const { t, onRef } = this.props;
        onRef(this);
        nodejs.start('main.js');
        nodejs.channel.addListener(
            'message',
            async (msg) => {
                if (msg === 'error') {
                    return this.props.generateAlert(
                        'error',
                        t('global:unrecognisedPassword'),
                        t('global:unrecognisedPasswordExplanation'),
                    );
                }
                this.props.onSeedImport(msg);
                return this.props.generateAlert(
                    'success',
                    t('seedVault:importSuccess'),
                    t('seedVault:importSuccessExplanation'),
                );
            },
            this,
        );
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
        nodejs.channel.removeAllListeners();
    }

    /**
     * Validates SeedVault password
     * @method validatePassword
     */
    validatePassword(password) {
        const { t } = this.props;
        if (password === '') {
            return this.props.generateAlert('error', t('login:emptyPassword'), t('emptyPasswordExplanation'));
        }
        const seedVaultString = this.state.seedVault.toString();
        return nodejs.channel.send('import:' + seedVaultString + ':' + password);
    }

    /**
     * Opens document picker, reads chosen file and opens password validation modal
     * @method importSeedVault
     */
    importSeedVault() {
        const { t } = this.props;
        DocumentPicker.show(
            {
                filetype: [isAndroid ? 'application/octet-stream' : 'public.data'],
            },
            (error, res) => {
                if (error) {
                    return this.props.generateAlert(
                        'error',
                        t('global:somethingWentWrong'),
                        t('global:somethingWentWrongTryAgain'),
                    );
                }
                let path = res.uri;
                if (path.startsWith('file://')) {
                    path = path.slice(7);
                }
                RNFetchBlob.fs
                    .readFile(path, 'ascii')
                    .then((data) => {
                        this.setState({ seedVault: data });
                        this.props.openPasswordValidationModal();
                    })
                    .catch(() =>
                        this.props.generateAlert(
                            'error',
                            t('seedVault:seedFileError'),
                            t('seedVault:seedFileErrorExplanation'),
                        ),
                    );
            },
        );
    }

    render() {
        const { t, theme } = this.props;

        return (
            <TouchableOpacity onPress={() => this.importSeedVault()} style={{ flex: 0.7, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row' }}>
                    <Icon name="vault" size={width / 22} color={theme.body.color} />
                    <Text style={[styles.infoText, { color: theme.body.color }]}>{t('seedVault:importSeedVault')}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    generateAlert,
};

export default translate(['seedVault', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(SeedVaultImportComponent),
);
