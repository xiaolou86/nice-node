import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Header } from '../../renderer/Generics/redesign/Header/Header';

export default {
  title: 'Generic/Header',
  component: Header,
} as ComponentMeta<typeof Header>;

const Template: ComponentStory<typeof Header> = (args) => <Header {...args} />;

export const Primary = Template.bind({});

Primary.args = {
  nodeOverview: {
    name: 'besu',
    title: 'Ethereum node',
    info: 'Non-Validating Node — Ethereum mainnet',
    screenType: 'nodePackage',
    rpcTranslation: 'eth-l1',
    status: {
      updating: false,
      initialized: true,
      synchronized: true,
      lowPeerCount: true,
      updateAvailable: true,
      blocksBehind: false,
      noConnection: false,
      stopped: false,
      error: false,
    },
    stats: {
      currentSlot: 90,
      highestSlot: 190,
      cpuLoad: 90,
      diskUsageGBs: 10000,
    },
  },
};
