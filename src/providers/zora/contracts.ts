import { Hex, Chain } from 'viem';
import * as chains from 'viem/chains';

const contracts = (
  chain: Chain,
): {
  ZORA_NFT_CREATOR_PROXY: {
    address: Hex;
    deployedBlock?: number;
  };
  DROP_METADATA_RENDERER: {
    address: Hex;
    deployedBlock?: number;
  };
  EDITION_METADATA_RENDERER?: {
    address: Hex;
    deployedBlock?: number;
  };
} => {
  switch (chain) {
    case chains.base:
      return {
        ZORA_NFT_CREATOR_PROXY: {
          address: '0x58C3ccB2dcb9384E5AB9111CD1a5DEA916B0f33c',
          deployedBlock: 1461363,
        },
        DROP_METADATA_RENDERER: {
          address: '0xF77330C8b1c41f2e44470763Cf9E3ACa78Db4381',
          deployedBlock: 1461347,
        },
      };
    case chains.mainnet:
      return {
        ZORA_NFT_CREATOR_PROXY: {
          address: '0xF74B146ce44CC162b601deC3BE331784DB111DC1',
          deployedBlock: 14758780,
        },
        DROP_METADATA_RENDERER: {
          address: '0x5914d9a241008b9f02f22811bf3a77e02b84d226',
          deployedBlock: 14796811,
        },
      };
    case chains.optimism:
      return {
        ZORA_NFT_CREATOR_PROXY: {
          address: '0x7d1a46c6e614A0091c39E102F2798C27c1fA8892',
          deployedBlock: 97155865,
        },
        DROP_METADATA_RENDERER: {
          address: '0x96CcF205A366E15E261d77B14586389f80a029e9',
          deployedBlock: 97155822,
        },
        EDITION_METADATA_RENDERER: {
          address: '0xa2a7D8bcE0bf58D177137ECB94f3Fa6aA06aA7A1',
          deployedBlock: 97155826,
        },
      };
    /*
      case chains.PGN:
      return {
        ZORA_NFT_CREATOR_PROXY: {
          address: '0x48d8db63724444C6270749fEe80bBDB6CF33677f',
        },
        DROP_METADATA_RENDERER: {
          address: '0xd77783B9df27BC9ABd438d1ddE67e3afB64618e0',
        },
      };
      */
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
      };
  }

  throw new Error(`Unknown chain ${chain}`);
};

export default contracts;
