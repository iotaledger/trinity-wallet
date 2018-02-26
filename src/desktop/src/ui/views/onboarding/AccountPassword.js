import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { addAndSelectSeed, clearSeeds } from 'actions/seeds';
import { showError } from 'actions/notifications';
import { seedsSelector } from 'selectors/seeds';
import { isValidPassword } from 'libs/util';
import { securelyPersistSeeds } from 'libs/crypto';
import Button from 'ui/components/Button';
import Infobox from 'ui/components/Info';
import PasswordInput from 'ui/components/input/Password';

/**
 * Onboarding, set account password
 */
class AccountPassword extends React.PureComponent {
    static propTypes = {
        /** Current state seed data */
        seeds: PropTypes.object,
        /** Clear state seed data */
        clearSeeds: PropTypes.func.isRequired,
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Error modal helper
         * @param {Object} content - error screen content
         * @ignore
         */
        showError: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        password: '',
        passwordConfirm: '',
    };

    setPassword = (e) => {
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
        history.push('/onboarding/done');
    };

    render() {
        const { t } = this.props;
        return (
            <form onSubmit={this.setPassword}>
                <div />
                <section>
                    <PasswordInput
                        value={this.state.password}
                        label={t('global:password')}
                        onChange={(value) => this.setState({ password: value })}
                    />
                    <PasswordInput
                        value={this.state.passwordConfirm}
                        label={t('setPassword:retypePassword')}
                        onChange={(value) => this.setState({ passwordConfirm: value })}
                    />
                    <Infobox>
                        <p>{t('setPassword:anEncryptedCopy')}</p>
                    </Infobox>
                </section>
                <footer>
                    <Button to="/seed/name" className="outline" variant="highlight">
                        {t('global:back')}
                    </Button>
                    <Button className="outline" variant="primary">
                        {t('global:done')}
                    </Button>
                </footer>
            </form>
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

export default translate()(connect(mapStateToProps, mapDispatchToProps)(AccountPassword));
