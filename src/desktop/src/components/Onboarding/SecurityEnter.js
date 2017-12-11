import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { addAndSelectSeed, clearSeeds } from 'actions/seeds';
import { setOnboardingCompletionStatus } from 'actions/app';
import { showError } from 'actions/notifications';
import { seedsSelector } from 'selectors/seeds';
import { isValidPassword } from '../../../../shared/libs/util';
import Template, { Content, Footer } from './Template';
import { securelyPersistSeeds } from 'libs/util';
import Button from '../UI/Button';
import Infobox from '../UI/Infobox';
import PasswordInput from '../UI/PasswordInput';
import css from '../Layout/Onboarding.css';

class SecurityEnter extends React.PureComponent {
    static propTypes = {
        clearSeeds: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        seeds: PropTypes.object,
        showError: PropTypes.func.isRequired,
        setOnboardingCompletionStatus: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
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
                title: t('error2_title'),
                text: t('error2_text'),
            });
        }

        if (!isValidPassword(password)) {
            return showError({
                title: t('error1_title'),
                text: t('error1_text'),
            });
        }

        securelyPersistSeeds(password, seeds);
        clearSeeds();
        setOnboardingCompletionStatus(true);
        history.push('/done');
    };

    render() {
        const { t } = this.props;
        return (
            <Template type="form" onSubmit={this.onRequestNext}>
                <Content>
                    <p>{t('text')}</p>
                    <div className={css.formGroup}>
                        <PasswordInput placeholder={t('placeholder1')} name="password" onChange={this.changeHandler} />
                    </div>
                    <div className={css.formGroup}>
                        <PasswordInput
                            placeholder={t('placeholder2')}
                            name="passwordConfirm"
                            onChange={this.changeHandler}
                        />
                    </div>
                    <Infobox>
                        <p>{t('explanation')}</p>
                        <p>
                            <strong>{t('reminder')}</strong>
                        </p>
                    </Infobox>
                </Content>
                <Footer>
                    <Button to="/seed/name" variant="warning">
                        {t('button2')}
                    </Button>
                    <Button type="submit" variant="success">
                        {t('button1')}
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
    setOnboardingCompletionStatus,
    addAndSelectSeed,
    clearSeeds,
    showError,
};

export default translate('setPassword')(connect(mapStateToProps, mapDispatchToProps)(SecurityEnter));
