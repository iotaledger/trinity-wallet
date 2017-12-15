import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { formatValue, formatUnit, round } from 'libs/util';
import { getSeedItems, getSelectedIndex } from 'selectors/seeds';
import { selectSeed } from 'actions/seeds';
import Logo from 'components/UI/Logo';
import css from 'components/Layout/Main.css';

class Header extends React.PureComponent {
    static propTypes = {
        seeds: PropTypes.array,
        selectedSeedIndex: PropTypes.number,
        selectSeed: PropTypes.func.isRequired,
        account: PropTypes.object.isRequired,
    };

    render() {
        const { seeds, selectedSeedIndex, selectSeed, account } = this.props;
        return (
            <header>
                <div className={css.logo}>
                    <Logo width={38} />
                </div>
                <div className={css.seedsList}>
                    <ul>
                        {seeds.map((seed, index) => {
                            return (
                                <li
                                    className={selectedSeedIndex === index ? css.active : ''}
                                    key={seed.seed}
                                    onClick={() => selectSeed(index)}
                                >
                                    <h1>{seed.name}</h1>
                                    <h2>{`${formatValue(account.balance)} ${formatUnit(account.balance)}`}</h2>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </header>
        );
    }
}

const mapStateToProps = state => ({
    account: state.account,
    seeds: getSeedItems(state),
    selectedSeedIndex: getSelectedIndex(state),
});

const mapDispatchToProps = {
    selectSeed,
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
