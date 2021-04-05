import { Web3Provider } from "@ethersproject/providers";

import { apiRequest } from "./util";

export const login = async ({ provider }) => {
  console.log({ provider });
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  console.log({ address });

  const nonceResult = await apiRequest(`v1/sessions?PublicAddress=${address}`, "GET");

  const nonce = nonceResult.nonce;
  console.log({ nonce });

  // sign nonce
  const signature = await signer.signMessage(`I am signing my one-time nonce: ${nonce}`);
  console.log({ signature });

  const loginResult = await apiRequest(`v1/sessions?PublicAddress=${address}`, "POST", {
    publicAddress: address,
    signature,
  });

  console.log({loginResult})

  // get token

  // return token
};
