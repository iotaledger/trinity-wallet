import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { renameCurrentSeed } from 'actions/seeds';
import { getSelectedSeed } from 'selectors/seeds';
import Template, { Content, Footer } from './Template';
import Infobox from '../UI/Infobox';
import Button from '../UI/Button';
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

    setName = e => {
        const { target } = e;
        this.setState(() => ({
            name: target.value,
        }));
    };

    onRequestNext = () => {
        const { renameCurrentSeed, history, t } = this.props;
        if (this.state.name) {
            renameCurrentSeed(this.state.name);
        } else {
            renameCurrentSeed(t('placeholder'));
        }
        history.push('/security/enter');
    };

    render() {
        const { t } = this.props;
        const { name } = this.state;
        return (
            <Template>
                <Content>
                    <p>{t('text')}</p>
                    <div className={css.formGroup}>
                        <label>{t('label')}</label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            placeholder={t('placeholder')}
                            onChange={this.setName}
                        />
                    </div>
                    <Infobox>
                        <p>{t('explanation')}</p>
                    </Infobox>
                </Content>
                <Footer>
                    <Button to="/seed/enter" variant="warning">
                        {t('button2')}
                    </Button>
                    <Button onClick={this.onRequestNext} variant="success">
                        {t('button1')}
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
    renameCurrentSeed,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate('nameYourSeed')(SeedName));
