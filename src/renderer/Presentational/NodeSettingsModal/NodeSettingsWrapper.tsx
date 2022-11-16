import { useCallback, useEffect, useState } from 'react';
import {
  ConfigTranslation,
  ConfigTranslationMap,
  ConfigValue,
  FilePathControlType,
} from '../../../common/nodeConfig';
import electron from '../../electronGlobal';
import { CategoryConfig } from '../../Generics/redesign/DynamicSettings/DynamicSettings';
import { useAppSelector } from '../../state/hooks';
import { selectSelectedNode } from '../../state/node';
import RemoveNodeWrapper, {
  RemoveNodeAction,
} from '../RemoveNodeModal/RemoveNodeWrapper';
import NodeSettings from './NodeSettingsModal';

export type SettingChangeHandler = (
  configKey: string,
  newValue: ConfigValue
) => void;
export interface NodeSettingsWrapperProps {
  isOpen: boolean;
  onClickClose: () => void;
}

const NodeSettingsWrapper = ({
  isOpen,
  onClickClose,
}: NodeSettingsWrapperProps) => {
  const [sIsConfigDisabled, setIsConfigDisabled] = useState<boolean>(true);
  const [sConfigTranslationMap, setConfigTranslationMap] =
    useState<ConfigTranslationMap>();
  const [sCategoryConfigs, setCategoryConfigs] = useState<CategoryConfig[]>();
  const [sIsRemoveNodeModalOpen, setIsRemoveNodeModalOpen] =
    useState<boolean>(false);

  const selectedNode = useAppSelector(selectSelectedNode);

  useEffect(() => {
    let isDisabled = true;
    let configTranslationMap;
    console.log(selectedNode);
    if (selectedNode) {
      isDisabled = ['running', 'starting'].includes(selectedNode.status);
      configTranslationMap = selectedNode.spec.configTranslation;
    }
    setIsConfigDisabled(isDisabled);
    setConfigTranslationMap(configTranslationMap);
  }, [selectedNode]);
  // configTranslationMap = selectedNode.spec.configTranslation;

  useEffect(() => {
    // category to configs
    const categoryMap: Record<string, ConfigTranslationMap> = {};
    if (sConfigTranslationMap) {
      Object.keys(sConfigTranslationMap).forEach((configKey) => {
        const configTranslation: ConfigTranslation =
          sConfigTranslationMap[configKey];
        const category = configTranslation.category ?? 'Other';
        if (!categoryMap[category]) {
          categoryMap[category] = {};
        }
        categoryMap[category][configKey] = configTranslation;
      });
    }
    const arr = Object.keys(categoryMap).map((category) => {
      return {
        category,
        configTranslationMap: categoryMap[category],
      };
    });

    // Put 'Other' category at the bottom
    arr.sort((x, y) => {
      if (x.category === 'Other') {
        return 1;
      }
      if (y.category === 'Other') {
        return -1;
      }
      return 0;
    });

    setCategoryConfigs(arr);
  }, [sConfigTranslationMap]);

  /**
   * Sent from the individual setting input component
   * @param configKey
   * @param newValue
   */
  const onNodeConfigChange: SettingChangeHandler = async (
    configKey: string,
    newValue: ConfigValue
  ) => {
    // updateNode
    console.log('updating node with newValue: ', newValue);
    if (selectedNode?.config) {
      // If the configChange is for a folder location, open electron
      const { configValuesMap } = selectedNode.config;
      const currentValue = configValuesMap[configKey];
      const { configTranslation } = selectedNode.spec;
      if (
        configTranslation &&
        configTranslation[configKey]?.uiControl.type === FilePathControlType
      ) {
        const openDialogForNodeDataDir =
          await electron.openDialogForNodeDataDir(selectedNode.id);
        console.log(
          'openDialogForNodeDataDir before, and res:',
          currentValue,
          openDialogForNodeDataDir
        );
      } else {
        const newConfig = {
          ...selectedNode.config,
          configValuesMap: {
            ...configValuesMap,
            [configKey]: newValue,
          },
        };
        console.log('updating node with newConfig: ', newConfig);
        await electron.updateNode(selectedNode.id, {
          config: newConfig,
        });
      }
      // todo: show the user it was successful or not
    } else {
      console.error('No selectedNode detected. Unable to change settings');
    }
  };

  const onClickRemoveNode = useCallback(() => {
    setIsRemoveNodeModalOpen(true);
  }, []);

  const onCloseRemoveNode = useCallback(
    (action: RemoveNodeAction) => {
      // if node was removed, close the node settings
      //  select another node?
      // if remove node was "cancel"'d, keep settings open
      console.log('NodeSettingsWrapper: onCloseRemoveNode');
      setIsRemoveNodeModalOpen(false);
      if (action === 'remove') {
        onClickClose();
      }
    },
    [onClickClose]
  );

  return (
    <>
      <NodeSettings
        isOpen={isOpen}
        onClickClose={onClickClose}
        categoryConfigs={sCategoryConfigs}
        configValuesMap={selectedNode?.config.configValuesMap}
        isDisabled={sIsConfigDisabled}
        onChange={onNodeConfigChange}
        onClickRemoveNode={onClickRemoveNode}
      />
      <RemoveNodeWrapper
        isOpen={sIsRemoveNodeModalOpen}
        onClose={onCloseRemoveNode}
      />
    </>
  );
};

export default NodeSettingsWrapper;
