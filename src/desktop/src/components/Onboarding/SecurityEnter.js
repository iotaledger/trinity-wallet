import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { addAndSelectSeed, clearSeeds } from 'actions/seeds';
import { showError } from 'actions/notifications';
import { seedsSelector } from 'selectors/seeds';
import { isValidPassword } from 'libs/util';
import { securelyPersistSeeds } from 'libs/storage';
import Template, { Content, Footer } from 'components/Onboarding/Template';
import Button from 'ui/components/Button';
import Infobox from 'ui/components/Info';
import PasswordInput from 'components/UI/input/Password';

class SecurityEnter extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        clearSeeds: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        seeds: PropTypes.object,
        showError: PropTypes.func.isRequired,
    };

    state = {
        password: '',
        passwordConfirm: '',
    };

    onRequestNext = (e) => {
        e.preventDefault();
        const { clearSeeds, history, seeds, showError, t } = this.props;
        const { password, passwordConfirm } = this.state;

        if (password !== passwordConfirm) {
            return showError({
                title: t('changePassword:passwordsDoNotMatch'),
                text: t('changePassword:passwordsDoNotMatchExplanation'),
            });
        }

        if (!isValidPassword(password)) {
            return showError({
                title: t('changePassword:passwordTooShort'),
                text: t('changePassword:passwordTooShortExplanation'),
            });
        }

        securelyPersistSeeds(password, seeds);
        clearSeeds();
        history.push('/done');
    };

    updatePassword = (value) => {
        this.setState(() => ({
            password: value,
        }));
    };

    confirmPassword = (value) => {
        this.setState(() => ({
            passwordConfirm: value,
        }));
    };

    render() {
        const { t } = this.props;
        return (
            <Template type="form" onSubmit={this.onRequestNext}>
                <Content>
                    <p>{t('setPassword:nowWeNeedTo')}</p>
                    <PasswordInput
                        value={this.state.password}
                        label={t('global:password')}
                        onChange={this.updatePassword}
                    />
                    <PasswordInput
                        value={this.state.passwordConfirm}
                        label={t('setPassword:retypePassword')}
                        onChange={this.confirmPassword}
                    />
                    <Infobox>
                        <p>{t('setPassword:anEncryptedCopy')}</p>
                    </Infobox>
                </Content>
                <Footer>
                    <Button to="/seed/name" className="outline" variant="highlight">
                        {t('global:back')}
                    </Button>
                    <Button type="submit" className="outline" variant="primary">
                        {t('global:done')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

const mapStateToProps = (state) => ({
    seeds: seedsSelector(state),
});

const mapDispatchToProps = {
    addAndSelectSeed,
    clearSeeds,
    showError,
};

export default translate('setPassword')(connect(mapStateToProps, mapDispatchToProps)(SecurityEnter));
