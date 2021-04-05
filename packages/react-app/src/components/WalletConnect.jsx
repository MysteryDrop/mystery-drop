import React, { useCallback } from "react";
import { Web3Provider } from "@ethersproject/providers";

import { login } from '../util/auth'

export default function WalletConnect({ web3Modal, setProvider, jwtAuthToken, setJwtAuthToken }) {
  const logout = async () => {
    await web3Modal.clearCachedProvider();
    setTimeout(() => {
      window.location.reload();
    }, 1);
    setJwtAuthToken(null);
  };

  const connect = useCallback(async () => {
    const provider = await web3Modal.connect();
    console.log({provider})
    const newProvider = new Web3Provider(provider);
    await login({provider: newProvider})
    setProvider(newProvider);
  }, [setProvider, setJwtAuthToken]);

  return web3Modal?.cachedProvider? (
    <a className="button" onClick={logout}>
      Logout
    </a>
  ) : (
    <a className="button is-primary" onClick={connect}>
      <strong>Connect Wallet</strong>
    </a>
  );
}
