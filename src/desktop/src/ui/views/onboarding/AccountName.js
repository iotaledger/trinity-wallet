import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { renameCurrentSeed } from 'actions/seeds';
import { getSelectedSeed } from 'selectors/seeds';
import { showError } from 'actions/notifications';
import Infobox from 'ui/components/Info';
import Button from 'ui/components/Button';
import Input from 'ui/components/input/Text';

/**
 * Onboarding, set account name
 */
class AccountName extends React.PureComponent {
    static propTypes = {
        /* Rename current account */
        renameCurrentSeed: PropTypes.func.isRequired,
        /* Browser history object */
        history: PropTypes.object.isRequired,
        /* Error modal helper
         * @param {Object} content - error screen content
         * @ignore
         */
        showError: PropTypes.func.isRequired,
        /* Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        name: '',
    };

    setName = (e) => {
        e.preventDefault();
        const { renameCurrentSeed, history, showError, t } = this.props;
        const { name } = this.state;
        if (!name.length) {
            showError({
                title: t('addAdditionalSeed:noNickname'),
                text: t('addAdditionalSeed:noNicknameExplanation'),
            });
            return;
        }

        renameCurrentSeed(this.state.name);
        history.push('/onboarding/account-password');
    };

    render() {
        const { t } = this.props;
        const { name } = this.state;
        return (
            <form onSubmit={this.setName}>
                <main>
                    <section>
                        <Input
                            value={name}
                            label={t('addAdditionalSeed:accountName')}
                            onChange={(value) => this.setState({ name: value })}
                        />
                        <Infobox>
                            <p>{t('setSeedName:canUseMultipleSeeds')}</p>
                        </Infobox>
                    </section>
                    <footer>
                        <Button to="/seed/enter" className="outline" variant="highlight">
                            {t('global:back')}
                        </Button>
                        <Button className="outline" variant="primary">
                            {t('global:done')}
                        </Button>
                    </footer>
                </main>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: getSelectedSeed(state),
});

const mapDispatchToProps = {
    showError,
    renameCurrentSeed,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(AccountName));
