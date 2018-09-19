/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { MAX_SEED_LENGTH } from 'libs/iota/utils';
import { byteToChar } from 'libs/helpers';
import SeedStore from 'libs/SeedStore';

import { getSelectedAccountName, getSelectedAccountType } from 'selectors/accounts';

import Button from 'ui/components/Button';
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
        /** @ignore */
        accountName: PropTypes.string.isRequired,
        /** @ignore */
        accountType: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        action: null,
        seed: null,
    };

    /**
     * Trigger seed print after component is updated
     */
    componentDidUpdate(prevProps, prevState) {
        if (this.state.action === 'print' && !prevState.seed && this.state.seed) {
            window.print();
        }
    }

    /**
     * Retrieve seed and set to state
     */
    setSeed = async (password) => {
        const { accountName, accountType } = this.props;

        const seedStore = await new SeedStore[accountType](password, accountName);
        const seed = await seedStore.getSeed();

        this.setState({
            seed,
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
                        title: action === 'view' ? t('viewSeed:enterPassword') : t('login:enterPassword'),
                        confirm:
                            action === 'view'
                                ? t('accountManagement:viewSeed')
                                : action === 'export' ? t('seedVault:exportSeedVault') : t('paperWallet'),
                    }}
                />
            );
        }

        const checksum = seed ? Electron.getChecksum(seed) : '';

        return (
            <React.Fragment>
                <form>
                    <p className={css.seed}>
                        <span>
                            {seed && action === 'view'
                                ? seed.map((byte, index) => {
                                      if (index % 3 !== 0) {
                                          return null;
                                      }
                                      const letter = byteToChar(byte);
                                      return (
                                          <React.Fragment key={`${index}${letter}`}>
                                              {letter}
                                              {byteToChar(seed[index + 1])}
                                              {byteToChar(seed[index + 2])}{' '}
                                          </React.Fragment>
                                      );
                                  })
                                : new Array(MAX_SEED_LENGTH / 3).join('... ')}
                        </span>
                        {seed &&
                            action === 'view' && (
                                <small>
                                    {t('checksum')}: <strong>{checksum}</strong>
                                </small>
                            )}
                    </p>
                    <fieldset>
                        <Button
                            className="small"
                            onClick={() => this.setState({ action: action !== 'view' ? 'view' : null })}
                        >
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
                    <SeedPrint seed={seed} checksum={checksum} filled />
                </form>
                <Modal
                    variant="fullscreen"
                    isOpen={seed && action === 'export'}
                    onClose={() => this.setState({ action: null })}
                >
                    <SeedExport seed={seed || []} title={accountName} onClose={() => this.setState({ action: null })} />
                </Modal>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    accountName: getSelectedAccountName(state),
    accountType: getSelectedAccountType(state),
});

export default connect(mapStateToProps)(translate()(Seed));
