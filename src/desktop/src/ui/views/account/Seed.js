/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { MAX_SEED_LENGTH } from 'libs/iota/utils';
import { byteToChar } from 'libs/crypto';

import { getSelectedAccountName } from 'selectors/accounts';

import Button from 'ui/components/Button';
import Clipboard from 'ui/components/Clipboard';
import Modal from 'ui/components/modal/Modal';
import ModalPassword from 'ui/components/modal/Password';
import SeedPrint from 'ui/components/SeedPrint';
import SeedExport from 'ui/global/SeedExport';

import css from './seed.scss';

/**
 * Account Seed settings component
 */
class Seed extends PureComponent {
    static propTypes = {
        /** Current account name */
        accountName: PropTypes.string.isRequired,
        /** Translation helper
         * @param {String} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        action: null,
        seed: null,
    };

    setSeed = (password, seed) => {
        const { action } = this.state;
        if (action === 'print') {
            window.print();
        }

        this.setState({
            seed,
            action: action !== 'print' ? action : null,
        });
    };

    render() {
        const { accountName, t } = this.props;
        const { seed, action } = this.state;

        if (action && !seed) {
            return (
                <ModalPassword
                    isOpen
                    inline
                    onSuccess={this.setSeed}
                    onClose={() => this.setState({ action: null })}
                    seedName={accountName}
                    content={{
                        title: t('viewSeed:enterPassword'),
                        confirm:
                            action === 'view'
                                ? t('accountManagement:viewSeed')
                                : action === 'export'
                                    ? t('seedVault:exportSeedVault')
                                    : t('paperWallet'),
                    }}
                />
            );
        }

        const checksum = seed ? Electron.getChecksum(seed) : '';

        return (
            <React.Fragment>
                <form>
                    <p className={css.seed}>
                        <Clipboard
                            text={seed || ''}
                            title={t('copyToClipboard:seedCopied')}
                            success={t('copyToClipboard:seedCopiedExplanation')}
                        >
                            {seed && action === 'view'
                                ? seed.map((byte, index) => {
                                      if (index % 3 !== 0) {
                                          return null;
                                      }
                                      const letter = byteToChar(byte % 27);
                                      return (
                                          <React.Fragment key={`${index}${letter}`}>
                                              {letter}
                                              {byteToChar(seed[index + 1])}
                                              {byteToChar(seed[index + 2])}{' '}
                                          </React.Fragment>
                                      );
                                  })
                                : new Array(MAX_SEED_LENGTH / 3).join('... ')}
                        </Clipboard>
                    </p>
                    <fieldset>
                        <Button className="small" onClick={() => this.setState({ action: !action ? 'view' : null })}>
                            {action === 'view' ? t('settings:hide') : t('settings:show')}
                        </Button>
                        <Button
                            className="small"
                            onClick={() => (!seed ? this.setState({ action: 'print' }) : window.print())}
                        >
                            {t('paperWallet')}
                        </Button>
                        <Button className="small" onClick={() => this.setState({ action: 'export' })}>
                            {t('seedVault:exportSeedVault')}
                        </Button>
                    </fieldset>
                    {seed && <SeedPrint seed={seed} checksum={checksum} filled />}
                </form>
                <Modal
                    variant="fullscreen"
                    isOpen={seed && action === 'export'}
                    onClose={() => this.setState({ action: null })}
                >
                    <SeedExport seed={seed} title={accountName} onClose={() => this.setState({ action: null })} />
                </Modal>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    accountName: getSelectedAccountName(state),
});

export default connect(mapStateToProps)(translate()(Seed));
