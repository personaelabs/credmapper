import axios from 'axios';
import {
  CreateSignerResponse,
  GetSignerResponse,
  GetUserResponse,
  RegisterSignedKeyResponse,
} from '../types';

const neynarV1 = axios.create({
  baseURL: 'https://api.neynar.com/v1/farcaster',
  headers: {
    api_key: process.env.NEYNAR_API_KEY,
  },
});

const neynarV2 = axios.create({
  baseURL: 'https://api.neynar.com/v2/farcaster',
  headers: {
    api_key: process.env.NEYNAR_API_KEY,
  },
});

export const getUser = async (fid: string): Promise<GetUserResponse> => {
  const res = await neynarV1.get<GetUserResponse>(`/user?fid=${fid}`);
  return res.data;
};

export const createSigner = async (): Promise<CreateSignerResponse> => {
  const res = await neynarV2.post<CreateSignerResponse>('/signer');

  return res.data;
};

export const registerSignedKey = async ({
  signerUuid,
  signature,
  deadline,
}: {
  signerUuid: string;
  signature: string;
  deadline: number;
}): Promise<RegisterSignedKeyResponse> => {
  console.log('signerUuid', signerUuid);
  console.log('signature', signature);
  console.log('signature', signature);

  const res = await neynarV2.post<RegisterSignedKeyResponse>('/signer/signed_key', {
    signer_uuid: signerUuid,
    app_fid: process.env.FARCASTER_DEVELOPER_FID as string,
    deadline,
    signature,
  });

  return res.data;
};

export const getSigner = async (signerUuid: string): Promise<GetSignerResponse> => {
  const res = await neynarV2.get<GetSignerResponse>(`/signer?signer_uuid=${signerUuid}`);

  return res.data;
};
