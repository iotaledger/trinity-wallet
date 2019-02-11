/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { byteTritCheck, byteTritSweep } from 'actions/recovery';
import SeedStore from 'libs/SeedStore';

import Sidebar from 'ui/views/wallet/Sidebar';
import Dashboard from 'ui/views/wallet/Dashboard';
import Polling from 'ui/global/Polling';

import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Loading from 'ui/components/Loading';

import css from './index.scss';

/**
 * Wallet functionallity router wrapper component
 */
class Wallet extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        accountData: PropTypes.object.isRequired,
        /** @ignore */
        completedByteTritSweep: PropTypes.bool,
        /** @ignore */
        byteTritInfo: PropTypes.array,
        /** @ignore */
        byteTritCheck: PropTypes.func.isRequired,
        /** @ignore */
        byteTritSweep: PropTypes.func.isRequired,
        /** @ignore */
        password: PropTypes.object,
        /** @ignore */
        location: PropTypes.object,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        isSweeping: false,
    };

    componentDidMount() {
        if (!this.props.completedByteTritSweep) {
            this.byteTritCheck();
        }
    }

    byteTritCheck = () => {
        const { accountData, password } = this.props;
        const accounts = Object.keys(accountData).map(async (accountName) => {
            if (accountData[accountName].meta.type !== 'keychain') {
                return null;
            }
            try {
                const seedStore = await new SeedStore.keychain(password, accountName);
                return {
                    accountName,
                    seedStore,
                };
            } catch (err) {
                return null;
            }
        });

        Promise.all(accounts).then((accountData) => {
            accountData = accountData.filter((account) => account && account.accountName);
            this.props.byteTritCheck(accountData, Electron.genFn);
        });
    };

    byteTritSweep = (e) => {
        if (e) {
            e.preventDefault();
        }
        this.setState({
            isSweeping: true,
        });
        return this.props.byteTritSweep(SeedStore.keychain, Electron.dialog);
    };

    render() {
        const { completedByteTritSweep, byteTritInfo, location, history, t } = this.props;
        const { isSweeping } = this.state;

        if (byteTritInfo) {
            const accounts = byteTritInfo.map((account) => account.accountName).join(', ');

            return (
                <Modal isOpen onClose={() => {}}>
                    <div>
                        <h1>{t('bytetrit:title')}</h1>

                        <p style={{ maxWidth: '620px', margin: '0 auto 40px' }}>
                            {t('bytetrit:explanation')}
                            <br />
                            {t('bytetrit:explanationAccounts', { accounts })}
                        </p>

                        <Button loading={isSweeping} onClick={this.byteTritSweep}>
                            {!isSweeping ? t('bytetrit:proceed') : t('pleaseWait')}
                        </Button>
                    </div>
                </Modal>
            );
        }

        if (!completedByteTritSweep) {
            return <Loading loop />;
        }

        return (
            <main className={css.wallet}>
                <Polling />
                <Sidebar history={history} location={location} />
                <Dashboard location={location} history={history} />
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    accountData: state.accounts.accountInfo,
    completedByteTritSweep: state.settings.completedByteTritSweep,
    byteTritInfo: state.settings.byteTritInfo,
    password: state.wallet.password,
});

const mapDispatchToProps = {
    byteTritCheck,
    byteTritSweep,
};

export default withRouter(withI18n()(connect(mapStateToProps, mapDispatchToProps)(Wallet)));
