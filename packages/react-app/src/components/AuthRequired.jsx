import React, { useCallback } from "react";
import { Web3Provider } from "@ethersproject/providers";

import { login } from "../util/auth";
import { ReactComponent as UserImg } from "assets/person-fill.svg";
import "./AuthRequired.scss";

export default function AuthRequired({ provider, jwtAuthToken, setJwtAuthToken }) {
  const connect = useCallback(async () => {
    const token = await login({ provider });
    setJwtAuthToken(token);
  }, [setJwtAuthToken]);

  return (
    <div className="auth-required">
      <UserImg />
      <p>Account Required</p>
      <a className="button-alt is-primary" onClick={connect}>
        Sign In
      </a>
    </div>
  );
}
