import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import Template, { Content } from './Template';
import HistoryList from 'components/UI/HistoryList';
import css from './Balance.css';

class HistoryView extends React.Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        account: PropTypes.object.isRequired,
    };

    render() {
        const { account, seed } = this.props;
        const accountInfo = account.accountInfo[seed.name];

        return (
            <Template>
                <Content>
                    <section>
                        <HistoryList
                            transfers={accountInfo.transfers.length ? accountInfo.transfers : []}
                            addresses={Object.keys(accountInfo.addresses)}
                        />
                    </section>
                    <section />
                </Content>
            </Template>
        );
    }
}

const mapStateToProps = state => ({
    account: state.account,
    seed: getSelectedSeed(state),
});

const mapDispatchToProps = {};

export default translate('history')(connect(mapStateToProps, mapDispatchToProps)(HistoryView));
