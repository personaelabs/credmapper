import { Hex, Chain } from 'viem';
import * as chains from 'viem/chains';

const contracts = (
  chain: Chain,
): {
  ZORA_NFT_CREATOR_PROXY: {
    address: Hex;
    deployedBlock: number;
  };
  DROP_METADATA_RENDERER: {
    address: Hex;
    deployedBlock: number;
  };
  EDITION_METADATA_RENDERER?: {
    address: Hex;
    deployedBlock: number;
  };
  ERC1155_FACTORY_PROXY: {
    address: Hex;
    deployedBlock: number;
  };
} => {
  switch (chain) {
    case chains.zora:
      return {
        ZORA_NFT_CREATOR_PROXY: {
          address: '0xA2c2A96A232113Dd4993E8b048EEbc3371AE8d85',
          deployedBlock: 46799,
        },
        DROP_METADATA_RENDERER: {
          address: '0xCA7bF48453B72e4E175267127B4Ed7EB12F83b93',
          deployedBlock: 46799,
        },
        EDITION_METADATA_RENDERER: {
          address: '0xCA7bF48453B72e4E175267127B4Ed7EB12F83b93',
          deployedBlock: 46799,
        },
        ERC1155_FACTORY_PROXY: {
          address: '0x777777C338d93e2C7adf08D102d45CA7CC4Ed021',
          deployedBlock: 4664191,
        },
      };
  }

  throw new Error(`Unknown chain ${chain}`);
};

export default contracts;
