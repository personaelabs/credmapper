import 'dotenv/config';
import { NextApiRequest, NextApiResponse } from 'next';
import { createSigner, registerSignedKey } from '@/src/lib/neynar';
import { mnemonicToAccount } from 'viem/accounts';

// Copied fromhttps://github.com/manan19/example-farcaster-app/blob/9723a9e5cadf0263d4f5b935ee538e0fd9a7ab6c/src/server.ts#L118
const generateSignature = async (
  pubKey: string,
): Promise<{
  deadline: number;
  signature: string;
}> => {
  // DO NOT CHANGE ANY VALUES IN THIS CONSTANT
  const SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN = {
    name: 'Farcaster SignedKeyRequestValidator',
    version: '1',
    chainId: 10,
    verifyingContract: '0x00000000fc700472606ed4fa22623acf62c60553' as `0x${string}`,
  };

  // DO NOT CHANGE ANY VALUES IN THIS CONSTANT
  const SIGNED_KEY_REQUEST_TYPE = [
    { name: 'requestFid', type: 'uint256' },
    { name: 'key', type: 'bytes' },
    { name: 'deadline', type: 'uint256' },
  ];

  // const account = privateKeyToAccount(process.env.FARCASTER_PRIVATE_KEY as Hex);
  const account = mnemonicToAccount(process.env.FARCASTER_MNEMONIC as string);
  console.log(account);

  // Generates an expiration date for the signature
  // e.g. 1693927665
  const deadline = Math.floor(Date.now() / 1000) + 86400; // signature is valid for 1 day from now
  // You should pass the same value generated here into the POST /signer/signed-key Neynar API

  // Generates the signature
  const signature = await account.signTypedData({
    domain: SIGNED_KEY_REQUEST_VALIDATOR_EIP_712_DOMAIN,
    types: {
      SignedKeyRequest: SIGNED_KEY_REQUEST_TYPE,
    },
    primaryType: 'SignedKeyRequest',
    message: {
      requestFid: BigInt(process.env.FARCASTER_DEVELOPER_FID as string),
      key: pubKey,
      deadline: BigInt(deadline),
    },
  });

  // Logging the deadline and signature to be used in the POST /signer/signed-key Neynar API
  return { deadline, signature };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signer = await createSigner();

  const { deadline, signature } = await generateSignature(signer.public_key);

  const data = await registerSignedKey({
    signerUuid: signer.signer_uuid,
    signature,
    deadline,
  });

  res.status(200).json(data);
}
