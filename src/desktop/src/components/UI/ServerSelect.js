import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { setFullNode } from 'actions/settings';

class ServerSelect extends React.PureComponent {
    static propTypes = {
        availableNodes: PropTypes.array.isRequired,
        fullNode: PropTypes.string,
        onChange: PropTypes.func,
        setFullNode: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
    };

    state = {};

    changeHandler = (e) => {
        const { target } = e;
        const { onChange, setFullNode } = this.props;

        if (typeof onChange === 'function') {
            onChange(target.value);
        }

        if (target.value) {
            setFullNode(target.value);
        }
    };

    render() {
        const { availableNodes, fullNode, t } = this.props;

        return (
            <select defaultValue={fullNode} onChange={this.changeHandler}>
                {availableNodes.map((node) => (
                    <option key={node} value={node}>
                        {node}
                    </option>
                ))}
                <option value="">{t('other')}</option>
            </select>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({
    fullNode: ownProps.fullNode || state.settings.fullNode,
    availableNodes: state.settings.availableNodes,
});

const mapDispatchToProps = {
    setFullNode,
};

export default translate('lightserver')(connect(mapStateToProps, mapDispatchToProps)(ServerSelect));
