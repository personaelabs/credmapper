import { Cred, CredMeta } from './src/types';
import 'dotenv/config';

const credMeta: CredMeta[] = [
  /*
  {
    id: 'Devcon 5_owner',
    name: 'Devcon 5',
    image:
      'https://storage.googleapis.com/nftimagebucket/tokens/0x22c1f6050e56d2876009903609a2cc3fef83b415/preview/4804.png',
  },
  {
    id: 'SuperRare Collector Badge (2021)_owner',
    name: 'SuperRare Collector (2021)',
    image:
      // 'https://dl.openseauserdata.com/cache/originImage/files/6d53f54d19b173ce9e4c276908368f6b.gif',
      'https://storage.googleapis.com/personae-proving-keys/creddd/images/SuperRare%20Collector%20(2021).png',
  },
  {
    id: 'SuperRare Artist Badge (2021)_owner',
    name: 'SuperRare Artist (2021)',
    image:
      // 'https://i.seadn.io/gae/dcq7SbLBaH7Igr42JS8C2_HRAayoNcSRCz6jw9Stt8t44sEvv0RtniyJKb1TeBwWBzjP8VxpfHBniq1V6Mw_h9nP9GAyZN5FVxQU_y8?auto=format&dpr=1&w=1000',
      'https://storage.googleapis.com/personae-proving-keys/creddd/images/SuperRare%20Artist%20(2021).png',
  },
  {
    id: 'Crypto Punks_owner',
    name: 'Crypto Punks Owner',
    image:
      'https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=384',
  },
  {
    id: 'Pudgy Penguins_owner',
    name: 'Pudgy Penguins Owner',
    image:
      'https://i.seadn.io/gae/yNi-XdGxsgQCPpqSio4o31ygAV6wURdIdInWRcFIl46UjUQ1eV7BEndGe8L661OoG-clRi7EgInLX4LPu9Jfw4fq0bnVYHqg7RFi?auto=format&dpr=1&w=128',
  },
  */
  {
    id: 'Nouns',
    name: 'Nouns Owner',
    image: 'https://warpcast.com/~/channel-images/nouns.png',
    spotlight: true,
  },
  {
    id: 'Milady',
    name: 'Milady Owner',
    image:
      'https://i.seadn.io/gae/a_frplnavZA9g4vN3SexO5rrtaBX_cBTaJYcgrPtwQIqPhzgzUendQxiwUdr51CGPE2QyPEa1DHnkW1wLrHAv5DgfC3BP-CWpFq6BA?auto=format&dpr=1&w=384',
    spotlight: true,
  },
  {
    id: 'Azuki',
    name: 'Azuki Owner',
    image:
      'https://images.blur.io/_blur-prod/0xed5af388653567af2f388e6224dc7c4b3241c544/4361-29b9f08af6d9c52f?w=128',
    spotlight: true,
  },
  /*
  {
    id: 'Purple',
    name: 'Purple Owner',
    image:
      'https://i.seadn.io/gae/2R29pIWneHAMHH0e2Lcqsilv7vRBpnYngrKOZXBkhpyrlBVgcJzgPxPq_pWujLggzy-EW1Jt9QJIOQW7t95ufdgvwCAITd4fw0DvQJM?w=500&auto=format',
    spotlight: false,
  },
  */
  {
    id: 'Over10000Txs',
    name: 'Over 10,000 Txs',
    image: 'https://storage.googleapis.com/personae-proving-keys/creddd/images/eth-logo2.png',
    spotlight: true,
  },
  {
    id: 'BeaconDepositOver256ETH',
    name: 'Beacon Deposit Over 256 ETH',
    image: 'https://storage.googleapis.com/personae-proving-keys/creddd/images/core%20Small.png',
    spotlight: true,
  },
  {
    id: 'OnchainSince2016',
    name: 'Onchain since 2016',
    image: 'https://storage.googleapis.com/personae-proving-keys/creddd/images/eth-logo2.png',
    spotlight: true,
  },
  {
    id: 'SuperRareOg',
    name: 'SuperRare OG',
    image:
      //'https://downloads.intercomcdn.com/i/o/459919625/19f9536bc26f9bd56fdf0d02/2021_XCOPY_SR_BADGE_+%281%29.gif',
      'https://storage.googleapis.com/personae-proving-keys/creddd/images/SuperRare%20OG.png',
    spotlight: true,
  },
  {
    id: 'BeaconGenesisDepositor',
    name: 'Beacon Genesis Depositor',
    image:
      'https://storage.googleapis.com/personae-proving-keys/creddd/images/beacon-chain-genesis-depositor-2020.png',
    spotlight: true,
  },
];

export default credMeta;
