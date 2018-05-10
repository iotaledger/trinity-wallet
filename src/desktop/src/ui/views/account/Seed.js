import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { MAX_SEED_LENGTH } from 'libs/iota/utils';

import Button from 'ui/components/Button';
import Clipboard from 'ui/components/Clipboard';
import ModalPassword from 'ui/components/modal/Password';

import css from './seed.scss';

/**
 * Account Seed settings component
 */
class Seed extends PureComponent {
    static propTypes = {
        /** Current seed index
         *  @ignore
         */
        seedIndex: PropTypes.number.isRequired,
        /** Translation helper
         * @param {String} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        hidden: true,
        vault: false,
    };

    render() {
        const { seedIndex, t } = this.props;
        const { vault, hidden } = this.state;

        const seed = vault ? vault.seeds[seedIndex] : '';
        const content =
            hidden || !seed.length ? new Array(MAX_SEED_LENGTH / 3).join('··· ') : seed.match(/.{1,3}/g).join(' ');

        if (!hidden && !vault) {
            return (
                <ModalPassword
                    isOpen
                    inline
                    onSuccess={(password, vault) => this.setState({ vault })}
                    onClose={() => this.setState({ hidden: true })}
                    content={{
                        title: t('viewSeed:enterPassword'),
                    }}
                />
            );
        }

        return (
            <form>
                <p className={css.seed}>
                    <Clipboard
                        text={seed}
                        title={t('copyToClipboard:seedCopied')}
                        success={t('copyToClipboard:seedCopiedExplanation')}
                    >
                        {content}
                    </Clipboard>
                </p>
                <fieldset>
                    <Button onClick={() => this.setState({ hidden: !hidden })}>
                        {hidden ? t('settings:show') : t('settings:hide')}
                    </Button>
                </fieldset>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    seedIndex: state.wallet.seedIndex,
});

export default connect(mapStateToProps)(translate()(Seed));
