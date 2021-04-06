import React, { useCallback } from "react";
import { Web3Provider } from "@ethersproject/providers";

import { login } from '../util/auth'

export default function MysteryDropAuth({ provider, jwtAuthToken, setJwtAuthToken }) {
  const connect = useCallback(async () => {
    const token = await login({provider})
    setJwtAuthToken(token)
  }, [setJwtAuthToken]);

  return (
    <a className="button is-primary" onClick={connect}>
      <strong>Login</strong>
    </a>
  );
}
