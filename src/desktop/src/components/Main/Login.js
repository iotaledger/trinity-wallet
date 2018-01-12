/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSecurelyPersistedSeeds } from 'libs/storage';
import { getAccountInfo, getFullAccountInfo, setFirstUse } from 'actions/account';
import { showError } from 'actions/notifications';
import { loadSeeds } from 'actions/seeds';
import Template, { Content, Footer } from 'components/Onboarding/Template';
import PasswordInput from 'components/UI/input/Password';
import Button from 'components/UI/Button';
import Loading from 'components/UI/Loading';
import css from 'components/Layout/Onboarding.css';
import { setTimeout } from 'timers';

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
        getAccountInfo: PropTypes.func.isRequired,
        getFullAccountInfo: PropTypes.func.isRequired,
    };

    state = {
        loading: false,
        password: '',
    };

    componentWillReceiveProps(newProps) {
        const ready = !this.props.tempAccount.ready && newProps.tempAccount.ready;
        if (ready) {
            this.setState({
                loading: false,
            });
            this.props.history.push('/balance');

            Electron.updateMenu('authorised', true);
        }
    }

    setPassword = (password) => {
        this.setState({
            password: password,
        });
    };

    setupAccount(seed) {
        const { account, getFullAccountInfo, getAccountInfo } = this.props;

        if (account.firstUse) {
            getFullAccountInfo(seed.seed, seed.name);
        } else {
            getAccountInfo(seed.seed, seed.name);
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
    getFullAccountInfo,
    getAccountInfo,
    setFirstUse,
};

export default translate('login')(connect(mapStateToProps, mapDispatchToProps)(Login));
