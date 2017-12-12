import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { addAndSelectSeed, clearSeeds } from 'actions/seeds';
import { showError } from 'actions/notifications';
import { seedsSelector } from 'selectors/seeds';
import { isValidPassword } from 'libs/util';
import Template, { Content, Footer } from './Template';
import { securelyPersistSeeds } from 'libs/storage';
import Button from '../UI/Button';
import Infobox from '../UI/Infobox';
import PasswordInput from '../UI/PasswordInput';
import css from '../Layout/Onboarding.css';

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

    state = {};

    changeHandler = e => {
        const { target: { name, value } } = e;
        this.setState(() => ({
            [name]: value,
        }));
    };

    onRequestNext = e => {
        e.preventDefault();
        const { clearSeeds, history, seeds, setOnboardingCompletionStatus, showError, t } = this.props;
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

    render() {
        const { t } = this.props;
        return (
            <Template type="form" onSubmit={this.onRequestNext}>
                <Content>
                    <p>{t('setPassword:nowWeNeedTo')}</p>
                    <div className={css.formGroup}>
                        <PasswordInput
                            placeholder={t('global:password')}
                            name="password"
                            onChange={this.changeHandler}
                        />
                    </div>
                    <div className={css.formGroup}>
                        <PasswordInput
                            placeholder={t('setPassword:retypePassword')}
                            name="passwordConfirm"
                            onChange={this.changeHandler}
                        />
                    </div>
                    <Infobox>
                        <p>{t('setPassword:anEncryptedCopy')}</p>
                    </Infobox>
                </Content>
                <Footer>
                    <Button to="/seed/name" variant="warning">
                        {t('global:back')}
                    </Button>
                    <Button type="submit" variant="success">
                        {t('global:done')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

const mapStateToProps = state => ({
    seeds: seedsSelector(state),
});

const mapDispatchToProps = {
    addAndSelectSeed,
    clearSeeds,
    showError,
};

export default translate('setPassword')(connect(mapStateToProps, mapDispatchToProps)(SecurityEnter));
