import { indexCasts, indexReactions } from './casts';
import assignERC721s from './cred/assignERC721s';
import { indexUsers } from './providers/farcaster';
import { indexERC721 } from './providers/erc721/erc721';
import { indexPoap } from './providers/poap/poap';
import assignPoap from './cred/assignPoap';

const indexCred = async () => {
  console.time('indexUsers');
  await indexUsers();
  console.timeEnd('indexUsers');

  await indexERC721();
  await assignERC721s();

  // await indexPoap();
  await assignPoap();

  // Index casts
  console.time('indexCasts');
  await indexCasts();
  console.timeEnd('indexCasts');

  // Index reactions
  console.time('indexReactions');
  await indexReactions();
  console.timeEnd('indexReactions');
};

indexCred();
