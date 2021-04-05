import React, { useCallback } from "react";
import { Web3Provider } from "@ethersproject/providers";

import { login } from '../util/auth'

export default function MysteryDropAuth({ provider, jwtAuthToken, setJwtAuthToken }) {
  const logout = async () => {
    setJwtAuthToken(null);
  };

  const connect = useCallback(async () => {
    await login({provider})
  }, [setJwtAuthToken]);

  return jwtAuthToken? (
    <a className="button" onClick={logout}>
      Logout
    </a>
  ) : (
    <a className="button is-primary" onClick={connect}>
      <strong>Login</strong>
    </a>
  );
}
