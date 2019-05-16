import React, { useState } from 'react';
import PropTypes from 'prop-types';

import withNodeData from 'containers/settings/Node';

import Button from 'ui/components/Button';
import Text from 'ui/components/input/Text';
import Toggle from 'ui/components/Toggle';
import Number from 'ui/components/input/Number';
import Scrollbar from 'ui/components/Scrollbar';

import NodeCustom from './NodeCustom';

import { MINIMUM_QUORUM_SIZE } from '../../../../../shared/config';

import css from './index.scss';

/**
 * Change IRI API node component
 */
const NodeSettings = ({ customNodes, generateAlert, loading, nodes, settings, actions, t }) => {
    const [autoNodeSelection, setAutoNodeSelection] = useState(settings.autoNodeSelection);
    const [autoNodeList, setAutoNodeList] = useState(settings.autoNodeList);
    const [autoNodeSwitching, setAutoNodeSwitching] = useState(settings.autoNodeSwitching);
    const [primaryNode, setPrimaryNode] = useState(settings.node);
    const [quorumEnabled, setQuorumEnabled] = useState(settings.quorumEnabled);
    const [quorumSize, setQuorumSize] = useState(settings.quorumSize);
    const [showCustomNodes, setshowCustomNodes] = useState(false);

    const updateQuorumEnabled = () => {
        if (
            !quorumEnabled &&
            ((autoNodeList && nodes.length < MINIMUM_QUORUM_SIZE) ||
                (!autoNodeList && customNodes.length < MINIMUM_QUORUM_SIZE))
        ) {
            generateAlert(
                'error',
                t('nodeSettings:nodeEnoughNodesTitle'),
                autoNodeList
                    ? t('nodeSettings:nodeEnoughNodesExplanation')
                    : `${t('nodeSettings:nodeEnoughNodesExplanation')} ${t(
                          'nodeSettings:nodeEnoughNodesExplanationCustomNodes',
                      )}`,
            );
        } else {
            setQuorumEnabled(!quorumEnabled);
        }
    };

    const saveSettings = () => {
        if (autoNodeList !== settings.autoNodeList) {
            actions.updateAutoNodeListSetting(autoNodeList);
        }
        if (autoNodeSwitching !== settings.autoNodeSwitching) {
            actions.updateAutoNodeSwitching(autoNodeSwitching);
        }
        if (quorumEnabled !== settings.quorumEnabled || quorumSize !== settings.quorumSize) {
            actions.updateQuorumConfig({ enabled: quorumEnabled, size: quorumSize });
        }
        if (primaryNode !== settings.node) {
            return actions.setFullNode(primaryNode);
        }
        generateAlert(
            'success',
            t('nodeSettings:nodeSettingsUpdatedTitle'),
            t('nodeSettings:nodeSettingsUpdatedExplanation'),
        );
    };

    if (showCustomNodes) {
        return <NodeCustom onClose={() => setshowCustomNodes(false)} />;
    }

    return (
        <form>
            <div className={css.scroll}>
                <Scrollbar>
                    <article>
                        <Toggle
                            inline={t('nodeSettings:automaticNodeSelection')}
                            checked={autoNodeSelection}
                            onChange={setAutoNodeSelection}
                        />

                        <Button onClick={() => setshowCustomNodes(true)} className="small" type="button">
                            {t('nodeSettings:addCustomNodes')}
                        </Button>

                        <hr />
                        <Toggle
                            disabled={autoNodeSelection}
                            inline={t('nodeSettings:autoNodeList')}
                            checked={autoNodeList}
                            onChange={setAutoNodeList}
                        />

                        <hr />
                        <Toggle
                            disabled={autoNodeSelection}
                            inline={t('nodeSettings:nodeAutoswitching')}
                            checked={autoNodeSwitching}
                            onChange={setAutoNodeSwitching}
                        />
                        {!autoNodeSwitching &&
                            !autoNodeSelection && (
                                <Text
                                    value={primaryNode}
                                    label={t('nodeSettings:primaryNode')}
                                    onChange={setPrimaryNode}
                                />
                            )}

                        <hr />
                        <Toggle
                            disabled={autoNodeSelection}
                            inline={t('nodeSettings:enableQuorum')}
                            checked={quorumEnabled}
                            onChange={updateQuorumEnabled}
                        />
                        <Number
                            disabled={autoNodeSelection || !quorumEnabled}
                            inline
                            min={MINIMUM_QUORUM_SIZE}
                            max={autoNodeList ? nodes.length : customNodes.length}
                            value={quorumSize}
                            label={t('nodeSettings:quorumSize')}
                            onChange={setQuorumSize}
                        />
                    </article>
                </Scrollbar>
            </div>
            <footer>
                <Button
                    className="square"
                    loading={loading}
                    disabled={
                        autoNodeSelection === settings.autoNodeSelection &&
                        autoNodeList === settings.autoNodeList &&
                        autoNodeSwitching === settings.autoNodeSwitching &&
                        quorumEnabled === settings.quorumEnabled &&
                        primaryNode === settings.node
                    }
                    type="submit"
                    onClick={saveSettings}
                >
                    {t('global:save')}
                </Button>
            </footer>
        </form>
    );
};

NodeSettings.propTypes = {
    nodes: PropTypes.array.isRequired,
    customNodes: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    generateAlert: PropTypes.func.isRequired,
    settings: PropTypes.shape({
        autoNodeSwitching: PropTypes.bool.isRequired,
        autoNodeSelection: PropTypes.bool.isRequired,
        autoNodeList: PropTypes.bool.isRequired,
        node: PropTypes.string.isRequired,
        quorumEnabled: PropTypes.bool.isRequired,
        quorumSize: PropTypes.number.isRequired,
    }),
    actions: PropTypes.shape({
        updateAutoNodeListSetting: PropTypes.func.isRequired,
        updateAutoNodeSwitching: PropTypes.func.isRequired,
        updateQuorumConfig: PropTypes.func.isRequired,
        setFullNode: PropTypes.func.isRequired,
    }),
    t: PropTypes.func.isRequired,
};

export default withNodeData(NodeSettings);
