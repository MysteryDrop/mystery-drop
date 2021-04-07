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
  console.log({ signature });
  const recoveredAddress = utils.verifyMessage(msg, signature);
  console.log({ recoveredAddress });

  const loginResult = await apiRequest({path: `v1/sessions`, method: "POST", data: {
    publicAddress: address,
    signature,
  }});

  console.log({loginResult})

  const helloResult = await apiRequest({path: 'v1/helloAuth', method: 'GET', accessToken: loginResult.token})
  const testResult = await apiRequest({path: 'v1/jwttest', method: 'GET', accessToken: loginResult.token})
  console.log({helloResult})
  console.log({testResult})
  return loginResult.token;
};

export const logout = async ({setJwtAuthToken}) => setJwtAuthToken(null)
