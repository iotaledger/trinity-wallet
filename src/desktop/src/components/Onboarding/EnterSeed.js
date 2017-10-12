import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { isValidSeed } from '../../../../shared/libs/util';
import Header from './Header';
import ButtonLink from '../UI/ButtonLink';
import Button from '../UI/Button';
import Infobox from '../UI/Infobox';

import css from '../Layout/Onboarding.css';

class EnterSeed extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };

    state = {};

    onChange = e => {
        const { target: { name, value } } = e;
        this.setState(() => ({
            [name]: value,
        }));
    };

    getPaddedSeed = seed => {
        return `${seed}${'9'.repeat(81 - seed.length < 0 ? 0 : 81 - seed.length)}`;
    };

    onRequestNext = () => {
        if (!isValidSeed(this.state.seed)) {
        }
    };

    render() {
        const { t } = this.props;
        return (
            <form onSubmit={e => e.preventDefault()}>
                <Header headline={t('title')} />
                <main>
                    <div className={css.formGroup}>
                        <input type="text" name="seed" placeholder={t('placeholder')} onChange={this.onChange} />
                    </div>
                    <Infobox>
                        <p>{t('seed_explanation')}</p>
                        <p>{t('reminder')}</p>
                    </Infobox>
                </main>
                <footer>
                    <ButtonLink to="/onboarding/wallet" variant="warning">
                        {t('button3')}
                    </ButtonLink>
                    <Button type="submit" variant="success">
                        {t('button2')}
                    </Button>
                </footer>
            </form>
        );
    }
}

export default translate('enterSeed')(EnterSeed);
