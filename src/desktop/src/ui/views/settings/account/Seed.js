/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';

import { MAX_SEED_LENGTH } from 'libs/iota/utils';
import { byteToChar, capitalize } from 'libs/iota/converter';
import SeedStore from 'libs/SeedStore';

import Button from 'ui/components/Button';
import Modal from 'ui/components/modal/Modal';
import ModalPassword from 'ui/components/modal/Password';
import SeedPrint from 'ui/components/SeedPrint';
import SeedExport from 'ui/global/SeedExport';

import css from './seed.scss';
import cssIndex from '../index.scss';

/**
 * Account Seed settings component
 */
class Seed extends PureComponent {
    static propTypes = {
        /** @ignore */
        account: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        action: null,
        seed: false,
    };

    componentDidMount() {
        this.seed = [];
    }

    /**
     * Trigger seed print after component is updated
     */
    componentDidUpdate(_prevProps, prevState) {
        if (this.state.action === 'print' && !prevState.seed && this.state.seed) {
            window.print();
        }
    }

    componentWillUnmount() {
        for (let i = 0; i < this.seed.length * 3; i++) {
            this.seed[i % this.seed.length] = 0;
        }

        Electron.garbageCollect();
    }

    /**
     * Retrieve seed and set to state
     */
    setSeed = async (password) => {
        const { accountName, meta } = this.props.account;

        const seedStore = await new SeedStore[meta.type](password, accountName, meta);
        this.seed = await seedStore.getSeed();

        this.setState({
            seed: true,
        });
    };

    render() {
        const { t } = this.props;
        const { meta, accountName } = this.props.account;
        const { seed, action } = this.state;

        if (!SeedStore[meta.type].isSeedAvailable) {
            return (
                <div className={cssIndex.scroll}>
                    <article>
                        <h3>{t('viewSeed:notAvailable', { accountType: capitalize(meta.type) })}</h3>
                        {typeof meta.index === 'number' && (
                            <p>
                                {t('viewSeed:accountIndex')}: <strong>{meta.index}</strong>
                            </p>
                        )}
                        {typeof meta.page === 'number' &&
                            meta.page > 0 && (
                                <p>
                                    {t('viewSeed:accountPage')}: <strong>{meta.page}</strong>
                                </p>
                            )}
                    </article>
                </div>
            );
        }

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

        const checksum = seed ? Electron.getChecksum(this.seed) : '';

        return (
            <React.Fragment>
                <form>
                    <fieldset>
                        <p className={css.seed}>
                            <span>
                                {seed && action === 'view'
                                    ? this.seed.map((byte, index) => {
                                          if (index % 3 !== 0) {
                                              return null;
                                          }
                                          const letter = byteToChar(byte);
                                          return (
                                              <React.Fragment key={`${index}${letter}`}>
                                                  {letter}
                                                  {byteToChar(this.seed[index + 1])}
                                                  {byteToChar(this.seed[index + 2])}{' '}
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
                    </fieldset>
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
                    <SeedPrint seed={this.seed} checksum={checksum} filled />
                </form>
                <Modal
                    variant="fullscreen"
                    isOpen={seed && action === 'export'}
                    onClose={() => this.setState({ action: null })}
                >
                    <SeedExport
                        seed={this.seed || []}
                        title={accountName}
                        onClose={() => this.setState({ action: null })}
                    />
                </Modal>
            </React.Fragment>
        );
    }
}

export default withI18n()(Seed);
