import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formatValue, formatUnit } from 'libs/util';
import { getSeedItems, getSelectedIndex, getSelectedSeed } from 'selectors/seeds';
import { selectSeed } from 'actions/seeds';
import Logo from 'ui/components/Logo';

import css from './header.css';

class Header extends React.PureComponent {
    static propTypes = {
        seeds: PropTypes.array,
        selectedSeedIndex: PropTypes.number,
        selectSeed: PropTypes.func.isRequired,
        account: PropTypes.object.isRequired,
        seed: PropTypes.object.isRequired,
    };

    render() {
        const { seeds, seed, selectedSeedIndex, selectSeed, account } = this.props;

        const accountInfo = account.accountInfo[seed.name];

        return (
            <header className={css.header}>
                <div className={css.logo}>
                    <Logo size={38} />
                </div>
                <div className={css.accounts}>
                    <ul>
                        {seeds.map((seed, index) => {
                            return (
                                <li
                                    className={selectedSeedIndex === index ? css.active : ''}
                                    key={seed.seed}
                                    onClick={() => selectSeed(index)}
                                >
                                    <h1>{seed.name}</h1>
                                    <h2>{`${formatValue(accountInfo.balance)} ${formatUnit(accountInfo.balance)}`}</h2>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </header>
        );
    }
}

const mapStateToProps = (state) => ({
    account: state.account,
    seeds: getSeedItems(state),
    seed: getSelectedSeed(state),
    selectedSeedIndex: getSelectedIndex(state),
});

const mapDispatchToProps = {
    selectSeed,
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
