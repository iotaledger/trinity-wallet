import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { showNotification } from 'actions/notifications';
import { getSelectedSeed } from 'selectors/seeds';
import BoxedSeed from '../UI/BoxedSeed';
import Button from '../UI/Button';
import css from './SeedCopyToClipboard.css';

// TODO: Translate component
class SeedCopyToClipboard extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
        showNotification: PropTypes.func.isRequired,
    };

    render() {
        const { t, seed, showNotification } = this.props;

        return (
            <div>
                <p>{t('copyToClipboard:clickToCopy')}</p>
                <BoxedSeed t={t} seed={seed} />
                <div className={css.buttonWrapper}>
                    <CopyToClipboard text={seed}>
                        <Button
                            variant="cta"
                            onClick={() =>
                                showNotification({
                                    type: 'success',
                                    title: 'Seed copied to clipboard!',
                                })}
                        >
                            {t('copyToClipboard:copyToClipboard')}
                        </Button>
                    </CopyToClipboard>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state).seed,
});

const mapDispatchToProps = {
    showNotification,
};

export default translate('saveYourSeed3')(connect(mapStateToProps, mapDispatchToProps)(SeedCopyToClipboard));
