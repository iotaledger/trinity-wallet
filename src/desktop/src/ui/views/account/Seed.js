import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { MAX_SEED_LENGTH } from 'libs/util';

import Button from 'ui/components/Button';

import css from './seed.css';

/**
 * Account Seed settings component
 */
class Seed extends PureComponent {
    static propTypes = {
        /** Account vault */
        vault: PropTypes.object.isRequired,
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

        const seed = hidden ? Array(MAX_SEED_LENGTH).fill('·') : vault.items[seedIndex].seed;

        return (
            <form>
                <p className={css.seed}>{seed}</p>
                <fieldset>
                    <Button onClick={() => this.setState({ hidden: !hidden })}>{hidden ? t('show') : t('hide')}</Button>
                </fieldset>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    seedIndex: state.tempAccount.seedIndex,
});

export default connect(mapStateToProps)(translate()(Seed));
