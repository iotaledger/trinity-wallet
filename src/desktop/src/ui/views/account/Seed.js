/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { MAX_SEED_LENGTH } from 'libs/iota/utils';
import { byteToChar } from 'libs/crypto';

import { getSelectedAccountName } from 'selectors/accounts';

import Button from 'ui/components/Button';
import Clipboard from 'ui/components/Clipboard';
import ModalPassword from 'ui/components/modal/Password';
import SeedPrint from 'ui/components/SeedPrint';

import css from './seed.scss';

/**
 * Account Seed settings component
 */
class Seed extends PureComponent {
    static propTypes = {
        /** Current account name */
        accountName: PropTypes.string.isRequired,
        /** Translation helper
         * @param {String} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        hidden: true,
        seed: null,
    };

    render() {
        const { accountName, t } = this.props;
        const { seed, hidden } = this.state;

        if (!hidden && !seed) {
            return (
                <ModalPassword
                    isOpen
                    inline
                    onSuccess={(password, seed) => this.setState({ seed })}
                    onClose={() => this.setState({ hidden: true })}
                    seedName={accountName}
                    content={{
                        title: t('viewSeed:enterPassword'),
                    }}
                />
            );
        }

        const checksum = seed ? Electron.getChecksum(seed) : '';

        return (
            <form>
                <p className={css.seed}>
                    <Clipboard
                        text={seed || ''}
                        title={t('copyToClipboard:seedCopied')}
                        success={t('copyToClipboard:seedCopiedExplanation')}
                    >
                        {seed && !hidden
                            ? seed.map((byte, index) => {
                                  if (index % 3 !== 0) {
                                      return null;
                                  }
                                  const letter = byteToChar(byte % 27);
                                  return (
                                      <React.Fragment key={`${index}${letter}`}>
                                          {letter}
                                          {byteToChar(seed[index + 1])}
                                          {byteToChar(seed[index + 2])}{' '}
                                      </React.Fragment>
                                  );
                              })
                            : new Array(MAX_SEED_LENGTH / 3).join('... ')}
                    </Clipboard>
                </p>
                <fieldset>
                    <Button onClick={() => this.setState({ hidden: !hidden })}>
                        {hidden ? t('settings:show') : t('settings:hide')}
                    </Button>
                    {!hidden && <Button onClick={() => window.print()}>{t('paperWallet')}</Button>}
                </fieldset>
                {!hidden && <SeedPrint seed={seed} checksum={checksum} filled />}
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    accountName: getSelectedAccountName(state),
});

export default connect(mapStateToProps)(translate()(Seed));
