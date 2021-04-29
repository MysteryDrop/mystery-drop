import React, { useCallback, useContext } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { AuthContext } from "Contexts";

export default function WalletConnect({ web3Modal, setProvider }) {
  const [jwtAuthToken, setJwtAuthToken] = useContext(AuthContext);

  const logout = async () => {
    console.log('LOGOUT setting jwt null')
    await web3Modal.clearCachedProvider();
    setTimeout(() => {
      window.location.reload();
    }, 1);
    setJwtAuthToken(null);
  };

  const connect = useCallback(async () => {
    const provider = await web3Modal.connect();
    setProvider(new Web3Provider(provider));
  }, [setProvider, setJwtAuthToken]);

  return web3Modal?.cachedProvider ? (
    <a className="button" onClick={logout}>
      Logout
    </a>
  ) : (
    <a className="button is-primary" onClick={connect}>
      Connect Wallet
    </a>
  );
}
