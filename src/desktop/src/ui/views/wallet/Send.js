/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { formatValue, formatUnit } from 'libs/iota/utils';

import { getSeed } from 'libs/crypto';
import { getPoWFn } from 'libs/pow';

import AddressInput from 'ui/components/input/Address';
import AmountInput from 'ui/components/input/Amount';
import TextInput from 'ui/components/input/Text';
import Icon from 'ui/components/Icon';
import Button from 'ui/components/Button';
import Progress from 'ui/components/Progress';
import Balance from 'ui/components/Balance';
import Confirm from 'ui/components/modal/Confirm';
import withSendData from 'containers/wallet/Send';

import css from './send.scss';

/**
 * Send transaction component
 */
class Send extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        fields: PropTypes.shape({
            address: PropTypes.string.isRequired,
            amount: PropTypes.string.isRequired,
            message: PropTypes.string.isRequired,
        }),
        /** @ignore */
        isSending: PropTypes.bool.isRequired,
        /** @ignore */
        password: PropTypes.string.isRequired,
        /** @ignore */
        accountName: PropTypes.string.isRequired,
        /** @ignore */
        balance: PropTypes.number.isRequired,
        /** @ignore */
        settings: PropTypes.shape({
            conversionRate: PropTypes.number.isRequired,
            currency: PropTypes.string.isRequired,
        }),
        /** @ignore */
        progress: PropTypes.shape({
            progress: PropTypes.number,
            title: PropTypes.string,
        }),
        /** @ignore */
        validateInputs: PropTypes.func.isRequired,
        /** @ignore */
        sendTransfer: PropTypes.func.isRequired,
        /** @ignore */
        setSendAddressField: PropTypes.func.isRequired,
        /** @ignore */
        setSendAmountField: PropTypes.func.isRequired,
        /** @ignore */
        setSendMessageField: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        isTransferModalVisible: false,
        isUnitsVisible: false,
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.isSending !== nextProps.isSending) {
            Electron.updateMenu('enabled', !nextProps.isSending);
        }
    }

    validateInputs = (e) => {
        const { validateInputs } = this.props;

        e.preventDefault();

        this.setState({
            isTransferModalVisible: validateInputs(),
        });
    };

    updateFields(address, message, amount) {
        this.props.setSendAddressField(address);
        if (message) {
            this.props.setSendMessageField(message);
        }
        if (amount) {
            this.props.setSendAmountField(amount);
        }
    }

    confirmTransfer = async () => {
        const { fields, password, accountName, sendTransfer, settings, generateAlert, t } = this.props;

        this.setState({
            isTransferModalVisible: false,
        });

        let powFn = null;

        if (!settings.remotePoW) {
            try {
                powFn = getPoWFn();
            } catch (e) {
                return generateAlert('error', t('pow:noWebGLSupport'), t('pow:noWebGLSupportExplanation'));
            }
        }

        const seed = await getSeed(password, accountName, true);

        sendTransfer(seed, fields.address, parseInt(fields.amount) || 0, fields.message, null, powFn);
    };

    render() {
        const { fields, isSending, balance, settings, progress, t } = this.props;
        const { isTransferModalVisible, isUnitsVisible } = this.state;

        const transferContents =
            parseInt(fields.amount) > 0
                ? `${formatValue(fields.amount)} ${formatUnit(fields.amount)}`
                : t('transferConfirmation:aMessage');

        return (
            <form className={css.send} onSubmit={(e) => this.validateInputs(e)}>
                <Balance />
                <div className={isSending ? css.sending : null}>
                    <Confirm
                        category="primary"
                        isOpen={isTransferModalVisible}
                        onCancel={() => this.setState({ isTransferModalVisible: false })}
                        onConfirm={() => this.confirmTransfer()}
                        content={{
                            title: t('transferConfirmation:youAreAbout', { contents: transferContents }),
                            message: fields.address,
                            confirm: t('send'),
                            cancel: t('cancel'),
                        }}
                    />
                    <AddressInput
                        address={fields.address}
                        onChange={(address, message, amount) => {
                            this.updateFields(address, message, amount);
                        }}
                        label={t('send:recipientAddress')}
                        closeLabel={t('back')}
                    />
                    <AmountInput
                        amount={fields.amount}
                        settings={settings}
                        label={t('send:amount')}
                        labelMax={t('send:max')}
                        balance={balance}
                        onChange={(value) => this.props.setSendAmountField(value)}
                    />
                    <TextInput
                        value={fields.message}
                        label={t('send:message')}
                        onChange={(value) => this.props.setSendMessageField(value)}
                    />
                    <footer>
                        {!isSending ? (
                            <React.Fragment>
                                <Button to="/wallet/" variant="secondary" className="outlineSmall">
                                    {t('close')}
                                </Button>

                                <Button type="submit" className="small" variant="primary">
                                    {t('send:send')}
                                </Button>
                            </React.Fragment>
                        ) : (
                            <Progress {...progress} />
                        )}
                    </footer>
                </div>
                {!isUnitsVisible ? null : (
                    <div className={css.units} onClick={() => this.setState({ isUnitsVisible: false })}>
                        <div>
                            <h3>
                                <Icon icon="iota" size={32} />
                                {t('unitInfoModal:unitSystem')}
                            </h3>
                            <dl>
                                <dt>Ti</dt>
                                <dd>{t('unitInfoModal:trillion')}</dd>
                                <dd>1 000 000 000 000</dd>
                            </dl>
                            <dl>
                                <dt>Gi</dt>
                                <dd>{t('unitInfoModal:billion')}</dd>
                                <dd>1 000 000 000</dd>
                            </dl>
                            <dl>
                                <dt>Mi</dt>
                                <dd>{t('unitInfoModal:million')}</dd>
                                <dd>1 000 000</dd>
                            </dl>
                            <dl>
                                <dt>Ki</dt>
                                <dd>{t('unitInfoModal:thousand')}</dd>
                                <dd>1 000</dd>
                            </dl>
                            <dl>
                                <dt>i</dt>
                                <dd>{t('unitInfoModal:one')}</dd>
                                <dd>1</dd>
                            </dl>
                        </div>
                    </div>
                )}
            </form>
        );
    }
}

export default withSendData(Send);
