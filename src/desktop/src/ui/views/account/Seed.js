import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { MAX_SEED_LENGTH } from 'libs/iota/utils';

import Button from 'ui/components/Button';
import Clipboard from 'ui/components/Clipboard';

import css from './seed.css';

/**
 * Account Seed settings component
 */
class Seed extends PureComponent {
    static propTypes = {
        /** Account vault */
        vault: PropTypes.shape({
            seeds: PropTypes.arrayOf(PropTypes.string),
        }).isRequired,
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
    };

    render() {
        const { vault, seedIndex, t } = this.props;
        const { hidden } = this.state;

        const seed = vault.seeds[seedIndex];
        const content = hidden ? new Array(MAX_SEED_LENGTH / 3).join('··· ') : seed.match(/.{1,3}/g).join(' ');

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
                    <Button onClick={() => this.setState({ hidden: !hidden })}>{hidden ? t('show') : t('hide')}</Button>
                </fieldset>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    seedIndex: state.wallet.seedIndex,
});

export default connect(mapStateToProps)(translate()(Seed));
