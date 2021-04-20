import React, { useCallback, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";

import { login } from "../util/auth";
import { ReactComponent as UserImg } from "assets/person-fill.svg";
import "./AuthRequired.scss";

export default function AuthRequired({ provider, jwtAuthToken, setJwtAuthToken }) {
  const [awaitingJwt, setAwaitingJwt] = useState(false);

  const connect = useCallback(async () => {
    setAwaitingJwt(true);
    const token = await login({ provider });
    setJwtAuthToken(token);
    setAwaitingJwt(false);
  }, [setJwtAuthToken]);

  return (
    <div className="auth-required">
      <UserImg />
      <p>Account Required</p>
      <a className="button-alt is-primary" onClick={awaitingJwt ? null : connect}>
        Sign In
      </a>
    </div>
  );
}
