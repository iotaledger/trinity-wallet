import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { SwitchingConfig, changeIotaNode } from '../../libs/iota';
import { generateAlert } from '../../actions/alerts';
import { setFullNode } from '../../actions/settings';

/**
 * Node settings container
 * @ignore
 */
export default function withAutoNodeSwitching(AutoNodeSwitchedComponent) {
    class AutoNodeSwitching extends React.Component {
        static propTypes = {
            node: PropTypes.string.isRequired,
            autoNodeSwitching: PropTypes.bool.isRequired,
            generateAlert: PropTypes.func.isRequired,
            setFullNode: PropTypes.func.isRequired,
            t: PropTypes.func.isRequired,
        };

        constructor(props) {
            super(props);
        }

        componentWillMount() {
            const { autoNodeSwitching, node } = this.props;
            // re-inject auto switching to iota lib module up on startup
            SwitchingConfig.callbacks.push(this.showAlertOnAutoNodeSwitch);
            SwitchingConfig.autoSwitch = autoNodeSwitching;
            // force switch to node of settings
            changeIotaNode(node);
        }

        componentWillReceiveProps(newProps){
            const { autoNodeSwitching, node } = this.props;
            if (newProps.autoNodeSwitching !== autoNodeSwitching) {
                SwitchingConfig.autoSwitch = newProps.autoNodeSwitching;
            }
            if (newProps.node !== node) {
                changeIotaNode(newProps.node);
            }
        }

        showAlertOnAutoNodeSwitch = (newNode) => {
            const { generateAlert, setFullNode, t } = this.props;
            setFullNode(newNode);
            generateAlert('success', t('global:nodeAutoChanged'), t('global:nodeAutoChangedExplanation', { nodeAddress: newNode }));
        }

        render() {
            return <AutoNodeSwitchedComponent {...this.props} />;
        }
    }

    AutoNodeSwitching.displayName = `withAutoNodeSwitching(${AutoNodeSwitchedComponent.name})`;

    const mapStateToProps = (state) => ({
        node: state.settings.node,
        autoNodeSwitching: state.settings.autoNodeSwitching,
    });

    const mapDispatchToProps = {
        generateAlert,
        setFullNode,
    };

    return translate()(connect(mapStateToProps, mapDispatchToProps)(AutoNodeSwitching));
}
