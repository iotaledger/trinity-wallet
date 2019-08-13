import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import unionBy from 'lodash/unionBy';
import get from 'lodash/get';
import sample from 'lodash/sample';
import { withTranslation } from 'react-i18next';

import withNodeData from 'containers/settings/Node';

import { initialState as defaultSettings } from 'reducers/settings';

import Button from 'ui/components/Button';
import Toggle from 'ui/components/Toggle';
import Number from 'ui/components/input/Number';
import Select from 'ui/components/input/Select';
import Scrollbar from 'ui/components/Scrollbar';

import NodeCustom from './NodeCustom';

import { DEFAULT_NODE, MINIMUM_QUORUM_SIZE, MAXIMUM_QUORUM_SIZE } from '../../../../../shared/config';

import css from './index.scss';

/**
 * Change IRI API node component
 */
const NodeSettings = ({ customNodes, generateAlert, loading, nodes, settings, actions, t }) => {
    const isDefault =
        defaultSettings.autoNodeList === settings.autoNodeList &&
        defaultSettings.nodeAutoSwitch === settings.nodeAutoSwitch &&
        defaultSettings.quorum.enabled === settings.quorumEnabled &&
        defaultSettings.quorum.size === settings.quorumSize &&
        defaultSettings.node.url === settings.node.url &&
        defaultSettings.powNode === settings.powNode &&
        defaultSettings.powNodeAutoSwitch === settings.powNodeAutoSwitch;

    const [autoNodeSelection, setAutoNodeSelection] = useState(isDefault);
    const [autoNodeList, setAutoNodeList] = useState(settings.autoNodeList);
    const [nodeAutoSwitch, setNodeAutoSwitch] = useState(settings.nodeAutoSwitch);
    const [primaryNode, setPrimaryNode] = useState(settings.node);
    const [quorumEnabled, setQuorumEnabled] = useState(settings.quorumEnabled);
    const [quorumSize, setQuorumSize] = useState(settings.quorumSize);
    const [showCustomNodes, setshowCustomNodes] = useState(false);
    const [powNode, setPowNode] = useState(settings.powNode);
    const [powNodeAutoSwitch, setPowNodeAutoSwitch] = useState(settings.powNodeAutoSwitch);
    const [remotePoW, setRemotePoW] = useState(settings.remotePoW);

    const availableNodes = unionBy(customNodes, autoNodeList && nodes, nodeAutoSwitch && [DEFAULT_NODE], 'url');
    const availablePowNodes = availableNodes.filter(({ pow }) => pow);

    useEffect(() => {
        if (!loading && settings.node.url !== primaryNode.url) {
            setPrimaryNode(settings.node);
        }
    }, [settings]);

    useEffect(() => {
        setPowNode(settings.powNode);
    }, [showCustomNodes]);

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
            if (!quorumEnabled && !autoNodeList && quorumSize > customNodes.length) {
                setQuorumSize(customNodes.length);
            }
            setQuorumEnabled(!quorumEnabled);
        }
    };

    const togglePowNodeAutoSwitch = () => {
        setPowNode(settings.powNode || get(sample(availablePowNodes), 'url'));
        setPowNodeAutoSwitch(!powNodeAutoSwitch);
    };

    const updateAutoNodeList = () => {
        if (autoNodeList && customNodes.length < 1) {
            generateAlert('error', t('nodeSettings:noCustomNodes'), t('nodeSettings:mustAddCustomNodes'));
        } else {
            if (autoNodeList && customNodes.length < MINIMUM_QUORUM_SIZE) {
                setQuorumEnabled(false);
            } else if (autoNodeList && customNodes.length < quorumSize) {
                setQuorumSize(customNodes.length);
            }
            setAutoNodeList(!autoNodeList);
        }
    };

    const updateAutoNodeSelection = () => {
        if (!autoNodeSelection) {
            setAutoNodeList(defaultSettings.autoNodeList);
            setNodeAutoSwitch(defaultSettings.nodeAutoSwitch);
            setPrimaryNode(defaultSettings.node);
            setQuorumEnabled(defaultSettings.quorum.enabled);
            setQuorumSize(defaultSettings.quorum.size);
            setPowNode(defaultSettings.powNode);
            setPowNodeAutoSwitch(defaultSettings.powNodeAutoSwitch);
            setQuorumSize(defaultSettings.quorum.size);
        }
        setAutoNodeSelection(!autoNodeSelection);
    };

    const saveSettings = () => {
        if (autoNodeList !== settings.autoNodeList) {
            actions.changeAutoNodeListSetting(autoNodeList);
        }
        if (autoNodeList !== settings.autoNodeList) {
            actions.changeAutoNodeListSetting(autoNodeList);
        }
        if (nodeAutoSwitch !== settings.nodeAutoSwitch) {
            actions.updateNodeAutoSwitchSetting(nodeAutoSwitch);
        }
        if (quorumEnabled !== settings.quorumEnabled || quorumSize !== settings.quorumSize) {
            actions.updateQuorumConfig({ enabled: quorumEnabled, size: quorumSize });
        }
        if (powNode !== settings.powNode) {
            actions.setPowNode(powNode);
        }
        if (powNodeAutoSwitch !== settings.powNodeAutoSwitch) {
            actions.updatePowNodeAutoSwitchSetting(powNodeAutoSwitch);
        }
        if (remotePoW !== settings.remotePoW) {
            actions.changePowSettings();
        }
        if (primaryNode.url !== settings.node.url || primaryNode.password !== settings.node.password) {
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
                            inline={t('nodeSettings:automaticNodeManagement')}
                            checked={autoNodeSelection}
                            onChange={updateAutoNodeSelection}
                        />

                        <Button onClick={() => setshowCustomNodes(true)} className="small" type="button">
                            {t('nodeSettings:addCustomNodes')}
                        </Button>

                        <Toggle inline={t('nodeSettings:outsourcePow')} checked={remotePoW} onChange={setRemotePoW} />

                        <hr />
                        <Toggle
                            disabled={autoNodeSelection}
                            inline={t('nodeSettings:autoNodeList')}
                            checked={autoNodeList}
                            onChange={updateAutoNodeList}
                        />

                        <hr />
                        <Toggle
                            disabled={autoNodeSelection}
                            inline={t('nodeSettings:nodeAutoswitching')}
                            checked={nodeAutoSwitch}
                            onChange={setNodeAutoSwitch}
                        />
                        {!nodeAutoSwitch && (
                            <Select
                                label={t('nodeSettings:primaryNode')}
                                disabled={autoNodeSelection}
                                value={primaryNode.url}
                                onChange={(url) => setPrimaryNode(availableNodes.find((node) => node.url === url))}
                                options={availableNodes.map(({ url }) => {
                                    return { value: url };
                                })}
                            />
                        )}

                        <hr />
                        <Toggle
                            disabled={autoNodeSelection || !remotePoW}
                            inline={t('nodeSettings:autoSelectPowNode')}
                            checked={powNodeAutoSwitch}
                            onChange={togglePowNodeAutoSwitch}
                        />
                        {!powNodeAutoSwitch && (
                            <Select
                                value={powNode}
                                onChange={(url) => setPowNode(url)}
                                options={availablePowNodes.map(({ url }) => {
                                    return { value: url };
                                })}
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
                            max={Math.min(availableNodes.length, MAXIMUM_QUORUM_SIZE)}
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
                        autoNodeList === settings.autoNodeList &&
                        nodeAutoSwitch === settings.nodeAutoSwitch &&
                        quorumEnabled === settings.quorumEnabled &&
                        quorumSize === settings.quorumSize &&
                        primaryNode.url === settings.node.url &&
                        primaryNode.token === settings.node.token &&
                        primaryNode.password === settings.node.password &&
                        powNode === settings.powNode &&
                        powNodeAutoSwitch === settings.powNodeAutoSwitch &&
                        remotePoW === settings.remotePoW
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
        nodeAutoSwitch: PropTypes.bool.isRequired,
        autoNodeList: PropTypes.bool.isRequired,
        node: PropTypes.object.isRequired,
        powNode: PropTypes.string.isRequired,
        quorumEnabled: PropTypes.bool.isRequired,
        quorumSize: PropTypes.number.isRequired,
        remotePoW: PropTypes.bool.isRequired,
        powNodeAutoSwitch: PropTypes.bool.isRequired,
    }),
    actions: PropTypes.shape({
        changeAutoNodeListSetting: PropTypes.func.isRequired,
        updateNodeAutoSwitchSetting: PropTypes.func.isRequired,
        updateQuorumConfig: PropTypes.func.isRequired,
        setFullNode: PropTypes.func.isRequired,
        setPowNode: PropTypes.func.isRequired,
        changePowSettings: PropTypes.func.isRequired,
        updatePowNodeAutoSwitchSetting: PropTypes.func.isRequired,
    }),
    t: PropTypes.func.isRequired,
};

export default withTranslation()(withNodeData(NodeSettings));
