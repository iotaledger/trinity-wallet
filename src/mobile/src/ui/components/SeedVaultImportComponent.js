import isEmpty from 'lodash/isEmpty';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Keyboard } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import timer from 'react-native-timer';
import { DocumentPicker } from 'react-native-document-picker';
import { generateAlert } from 'shared-modules/actions/alerts';
import nodejs from 'nodejs-mobile-react-native';
import RNFetchBlob from 'rn-fetch-blob';
import { withNamespaces } from 'react-i18next';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { height, width } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';
import { isAndroid } from 'libs/device';
import { trytesToTrits } from 'shared-modules/libs/iota/converter';
import { UInt8ToString } from 'libs/crypto';

const styles = StyleSheet.create({
    infoText: {
        fontSize: Styling.fontSize3,
        fontFamily: 'SourceSansPro-Regular',
        paddingLeft: width / 70,
    },
    button: {
        justifyContent: 'center',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 20,
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

    constructor() {
        super();
        this.state = {
            seedVault: [],
        };
    }

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
                        t('seedVault:unrecognisedKey'),
                        t('seedVault:unrecognisedKeyExplanation'),
                    );
                }
                this.props.onSeedImport(trytesToTrits(msg));
                return timer.setTimeout(
                    'importSuccessTimeout',
                    () =>
                        this.props.generateAlert(
                            'success',
                            t('seedVault:importSuccess'),
                            t('seedVault:importSuccessExplanation'),
                        ),
                    300,
                );
            },
            this,
        );
    }

    componentWillUnmount() {
        timer.clearTimeout('delayDocumentPicker');
        timer.clearTimeout('importSuccessTimeout');
        this.props.onRef(undefined);
        nodejs.channel.removeAllListeners();
        delete this.state.seedVault;
    }

    /**
     * Validates SeedVault password
     * @method validatePassword
     */
    validatePassword(password) {
        const { t } = this.props;
        if (isEmpty(password)) {
            return this.props.generateAlert('error', t('seedVault:emptyKey'), t('seedVault:emptyKeyExplanation'));
        }
        const seedVaultString = this.state.seedVault.toString();
        // FIXME: Password should be UInt8, not string
        return nodejs.channel.send('import:' + seedVaultString + ':' + UInt8ToString(password));
    }

    /**
     * Grant storage read permissions for android
     *
     * @method grantPermissions
     * @returns {Promise}
     */
    grantPermissions() {
        return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then((granted) => {
            if (granted === true || granted === PermissionsAndroid.RESULTS.GRANTED) {
                return Promise.resolve(granted);
            }

            throw new Error('Read permissions not granted.');
        });
    }

    /**
     * Opens document picker, reads chosen file and opens password validation modal
     * @method showDocumentPicker
     */
    showDocumentPicker() {
        const { t } = this.props;
        DocumentPicker.show(
            {
                filetype: isAndroid
                    ? ['application/octet-stream']
                    : ['public.data', 'public.item', 'dyn.ah62d4rv4ge8003dcta'],
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
                        this.props.generateAlert('error', t('seedVault:seedFileError'), t('seedVault:seedFileErrorExplanation')),
                    );
            },
        );
    }

    /**
     * Initiates SeedVault import and requests permissions if necessary
     * @method importSeedVault
     */
    importSeedVault() {
        const { t } = this.props;
        Keyboard.dismiss();
        (isAndroid ? this.grantPermissions() : Promise.resolve())
            .then(() => {
                // Delay showing document picker to allow time for the keyboard to close
                timer.setTimeout('delayDocumentPicker', () => this.showDocumentPicker(), 200);
            })
            .catch((err) => {
                if (err.message === 'Read permissions not granted.') {
                    return this.props.generateAlert(
                        'error',
                        t('receive:missingPermission'),
                        t('receive:missingPermissionExplanation'),
                    );
                }
                throw err;
            });
    }

    render() {
        const { t, theme } = this.props;
        return (
            <TouchableOpacity onPress={() => this.importSeedVault()} style={styles.button}>
                <View style={styles.container}>
                    <Icon name="vault" size={width / 22} color={theme.body.color} />
                    <Text style={[styles.infoText, { color: theme.body.color }]}>{t('seedVault:importSeedVault')}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    generateAlert,
};

export default withNamespaces(['seedVault', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(SeedVaultImportComponent),
);
