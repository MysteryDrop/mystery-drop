import { Web3Provider } from "@ethersproject/providers";
import { utils } from "ethers";

import { apiRequest } from "./util";

export const login = async ({ provider }) => {
  console.log({ provider });
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  console.log({ address });

  const nonceResult = await apiRequest({path: `v1/sessions?PublicAddress=${address}`, method: "GET"});

  const nonce = nonceResult.nonce;
  console.log({ nonce });

  // sign nonce
  const msg = `I am signing my one-time nonce: ${nonce}`
  const signature = await signer.signMessage(msg);

  const loginResult = await apiRequest({path: `v1/sessions`, method: "POST", data: {
    publicAddress: address,
    signature,
  }});

  return loginResult.token;
};

export const logout = async ({setJwtAuthToken}) => setJwtAuthToken(null)
