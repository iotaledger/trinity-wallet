import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { renameCurrentSeed } from 'actions/seeds';
import { getSelectedSeed } from 'selectors/seeds';
import { showError } from 'actions/notifications';
import Template, { Content, Footer } from './Template';
import Infobox from '../UI/Infobox';
import Button from '../UI/Button';
import Input from 'components/UI/input/Text';
import css from '../Layout/Onboarding.css';

class SeedName extends React.PureComponent {
    static propTypes = {
        renameCurrentSeed: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        seed: PropTypes.shape({
            name: PropTypes.string,
        }).isRequired,
        t: PropTypes.func.isRequired,
    };

    state = {
        name: this.props.seed.name || '',
    };

    onRequestNext = () => {
        const { renameCurrentSeed, history, showError, t } = this.props;
        const { name } = this.state;
        if (!name.length) {
            showError({
                title: t('addAdditionalSeed:noNickname'),
                text: t('addAdditionalSeed:noNicknameExplanation'),
            });
            return;
        }
        if (this.state.name) {
            renameCurrentSeed(this.state.name);
        } else {
            renameCurrentSeed(t('placeholder'));
        }
        history.push('/security/enter');
    };

    setName = name => {
        this.setState(() => ({
            name: name,
        }));
    };

    render() {
        const { t } = this.props;
        const { name } = this.state;
        return (
            <Template>
                <Content>
                    <p>{t('addAdditionalSeed:enterAccountName')}</p>
                    <Input value={this.state.name} label={t('addAdditionalSeed:accountName')} onChange={this.setName} />
                    <Infobox>
                        <p>{t('setSeedName:canUseMultipleSeeds')}</p>
                    </Infobox>
                </Content>
                <Footer>
                    <Button to="/seed/enter" variant="secondary">
                        {t('global:back')}
                    </Button>
                    <Button onClick={this.onRequestNext} variant="success">
                        {t('global:done')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state),
});

const mapDispatchToProps = {
    showError,
    renameCurrentSeed,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate('nameYourSeed')(SeedName));
