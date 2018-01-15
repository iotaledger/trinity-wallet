import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import Template, { Content } from 'components/Main/Template';
import HistoryList from 'components/UI/HistoryList';

class HistoryView extends React.PureComponent {
    static propTypes = {
        account: PropTypes.object.isRequired,
        seed: PropTypes.object.isRequired,
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
