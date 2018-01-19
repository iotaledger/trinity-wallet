/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSecurelyPersistedSeeds } from 'libs/storage';
import { setFirstUse } from 'actions/account';
import { showError } from 'actions/notifications';
import { clearTempData } from 'actions/tempAccount';
import { loadSeeds, clearSeeds } from 'actions/seeds';
import { sendAmount } from 'actions/deepLinks.js';
import { runTask } from 'worker';
import Template, { Content, Footer } from 'components/Onboarding/Template';
import PasswordInput from 'components/UI/input/Password';
import Button from 'components/UI/Button';
import Loading from 'components/UI/Loading';
import css from 'components/Layout/Onboarding.css';
import { setTimeout } from 'timers';
import { ipcRenderer } from 'electron';
import { ADDRESS_LENGTH } from 'libs/util';

class Login extends React.Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        account: PropTypes.shape({
            firstUse: PropTypes.bool.isRequired,
        }).isRequired,
        tempAccount: PropTypes.object.isRequired,
        loadSeeds: PropTypes.func.isRequired,
        showError: PropTypes.func.isRequired,
        clearTempData: PropTypes.func.isRequired,
        clearSeeds: PropTypes.func.isRequired,
        sendAmount: PropTypes.func.isRequired
    };

    state = {
        loading: false,
        password: '',
    };

    componentDidMount() {
        this.props.clearTempData();
        this.props.clearSeeds();
        Electron.updateMenu('authorised', false);
        let regexAddress = /\:\/\/(.*?)\/\?/;
        let regexAmount = /amount=(.*?)\&/;
        let regexMessage = /message=([^\n\r]*)/;
        ipcRenderer.on('url-params', (e, data) => {
            let address = data.match(regexAddress);
            console.log('result '+ address);

            if (address !== null) {
               let amount = data.match(regexAmount);
                let message = data.match(regexMessage);
                this.setState({
                    address: address[1],
                    amount: amount[1],
                    message: message[1]
                });
                console.log(this.state.address);
                this.props.sendAmount(this.state.amount);
            } else {
                console.log(false);
            }
        });
    }

    componentWillReceiveProps(newProps) {
        const ready = !this.props.tempAccount.ready && newProps.tempAccount.ready;
        console.log('ready ' + ready);
        if (ready) {
            this.setState({
                loading: false,
            });
            console.log('after ready' + this.state);
            if(!this.state['amount']) {
                this.props.history.push('/balance');
                Electron.updateMenu('authorised', true);
            } else {
                this.props.history.push('/send');
            }
        }
    }

    setPassword = (password) => {
        this.setState({
            password: password,
        });
    };

    setupAccount(seed) {
        const { account } = this.props;

        if (account.firstUse) {
            console.log('firstuse');
            runTask('getFullAccountInfo', [seed.seed, seed.name]);
        } else {
            console.log('setupacc');
            runTask('getAccountInfo', [seed.seed, seed.name]);
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { password } = this.state;
        const { t, loadSeeds, showError } = this.props;

        let seeds = null;

        try {
            seeds = getSecurelyPersistedSeeds(password);
        } catch (err) {
            showError({
                title: t('global:unrecognisedPassword'),
                text: t('global:unrecognisedPasswordExplanation'),
            });
        }

        if (seeds) {
            loadSeeds(seeds);
            const seed = seeds.items[seeds.selectedSeedIndex];

            this.setState({
                loading: true,
            });
            console.log('loggin seed');
            //TODO: Fix iota.api call freeze. Do API calls in a worker/electron main?
            setTimeout(() => this.setupAccount(seed, seeds.selectedSeedIndex), 2000);
        }
    };

    render() {
        const { t } = this.props;
        const { loading } = this.state;

        if (loading) {
            return <Loading loop />;
        }

        return (
            <div className={css.wrapper}>
                <Template type="form" onSubmit={this.handleSubmit}>
                    <Content>
                        <PasswordInput
                            value={this.state.password}
                            label={t('global:password')}
                            name="password"
                            onChange={this.setPassword}
                        />
                    </Content>
                    <Footer>
                        <Button to="/seedlogin" variant="secondary">
                            {t('login:useSeed')}
                        </Button>
                        <Button variant="success">{t('login:login')}</Button>
                    </Footer>
                </Template>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    account: state.account,
    tempAccount: state.tempAccount,
});

const mapDispatchToProps = {
            showError,
            loadSeeds,
            clearTempData,
            clearSeeds,
            setFirstUse,
            sendAmount
        //     sendAmountDeepLink: amount => {
        //         console.log('dispatch test '+ amount);
        //     dispatch(sendAmount(amount));
        // }
};

export default translate('login')(connect(mapStateToProps, mapDispatchToProps)(Login));
