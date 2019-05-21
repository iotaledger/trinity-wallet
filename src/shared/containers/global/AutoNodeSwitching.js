import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';

import { SwitchingConfig } from '../../libs/iota';
import { generateAlert } from '../../actions/alerts';
import { setFullNode } from '../../actions/settings';

/**
 * Node settings container
 * @ignore
 */
export default function withAutoNodeSwitching(AutoNodeSwitchedComponent) {
    class AutoNodeSwitching extends React.Component {
        static propTypes = {
            node: PropTypes.object.isRequired,
            autoNodeSwitching: PropTypes.bool.isRequired,
            generateAlert: PropTypes.func.isRequired,
            setFullNode: PropTypes.func.isRequired,
            t: PropTypes.func.isRequired,
        };

        constructor(props) {
            super(props);
        }

        componentWillMount() {
            const { autoNodeSwitching } = this.props;
            // re-inject auto switching to iota lib module up on startup
            SwitchingConfig.callbacks.push(this.showAlertOnAutoNodeSwitch);
            SwitchingConfig.autoSwitch = autoNodeSwitching;
        }

        componentWillReceiveProps(newProps) {
            const { autoNodeSwitching } = this.props;
            if (newProps.autoNodeSwitching !== autoNodeSwitching) {
                SwitchingConfig.autoSwitch = newProps.autoNodeSwitching;
            }
        }

        showAlertOnAutoNodeSwitch = (newNode) => {
            const { generateAlert, setFullNode, t } = this.props;
            setFullNode(newNode);
            generateAlert(
                'success',
                t('global:nodeAutoChanged'),
                t('global:nodeAutoChangedExplanation', { nodeAddress: newNode }),
            );
        };

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

    return connect(mapStateToProps, mapDispatchToProps)(withI18n()(AutoNodeSwitching));
}
