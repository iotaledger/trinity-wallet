/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n, Trans } from 'react-i18next';

import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import SeedPrint from 'ui/components/SeedPrint';
import SeedExport from 'ui/global/SeedExport';

import SeedSaveWrite from './SeedSaveWrite';

import css from './index.scss';

/**
 * Onboarding, Seed backup step
 */
class SeedSave extends PureComponent {
    static propTypes = {
        /** @ignore */
        onboardingName: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        seed: Electron.getOnboardingSeed(),
        writeVisible: false,
        exportVisible: false,
    };

    render() {
        const { onboardingName, t } = this.props;
        const { writeVisible, exportVisible, seed } = this.state;

        const checksum = Electron.getChecksum(seed);

        return (
            <form>
                <section className={css.wide}>
                    <h1>{t('saveYourSeed:saveYourSeed')}</h1>
                    <Trans i18nKey="saveYourSeed:mustSaveYourSeed">
                        <p>
                            <span>You must save your seed with </span>
                            <strong>at least one</strong>
                            <span> of the options listed below.</span>
                        </p>
                    </Trans>
                    <nav className={css.choice}>
                        <a onClick={() => this.setState({ writeVisible: true })}>
                            <div>
                                <Icon icon="seedWrite" size={72} />
                            </div>
                            <h4>{t('saveYourSeed:writeYourSeedDown')}</h4>
                        </a>
                        <a onClick={() => this.setState({ exportVisible: true })} className={css.secure}>
                            <h3>{t('saveYourSeed:recommended')}</h3>
                            <div>
                                <Icon icon="seedVault" size={72} />
                            </div>
                            <h4>{t('seedVault:exportSeedVault')}</h4>
                        </a>
                        <a onClick={() => window.print()}>
                            <div>
                                <Icon icon="seedPrint" size={72} />
                            </div>
                            <h4>{t('paperWallet')}</h4>
                        </a>
                    </nav>
                </section>
                <footer>
                    <Button id="to-account-name" to="/onboarding/account-name" className="square" variant="dark">
                        {t('goBackStep')}
                    </Button>
                    <Button id="to-seed-verify" to="/onboarding/seed-verify" className="square" variant="primary">
                        {t('saveYourSeed:iHavesavedMySeed')}
                    </Button>
                </footer>
                <Modal
                    variant="fullscreen"
                    isOpen={writeVisible || exportVisible}
                    onClose={() => this.setState({ writeVisible: false, exportVisible: false })}
                >
                    {writeVisible ? (
                        <SeedSaveWrite
                            seed={seed}
                            checksum={checksum}
                            onClose={() => this.setState({ writeVisible: false })}
                        />
                    ) : (
                        <SeedExport
                            seed={seed}
                            title={onboardingName}
                            onClose={() => this.setState({ exportVisible: false })}
                        />
                    )}
                </Modal>
                {seed && <SeedPrint seed={seed} checksum={checksum} filled={!writeVisible} />}
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    onboardingName: state.accounts.accountInfoDuringSetup.name,
});

export default connect(mapStateToProps)(withI18n()(SeedSave));
