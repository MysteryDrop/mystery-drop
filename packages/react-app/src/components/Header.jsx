import React, { useState } from "react";
import logo from "assets/logo-small.svg";
import hamburger from "assets/hamburger.svg";
import WalletConnect from "./WalletConnect";
import "./Header.scss";

// displays a page header

export default function Header({
  loadWeb3Modal,
  web3Modal,
  logoutOfWeb3Modal,
  setProvider,
  jwtAuthToken,
  setJwtAuthToken,
}) {
  const route = window.location.pathname;
  const [expanded, setExpanded] = useState(false);

  return (
    <nav>
      <a className="logo" href="/">
        <img alt="Logo" src={logo} />
      </a>
      <div className={expanded ? "nav-links expanded" : "nav-links"}>
        <a href="/" className={route === "/" ? "nav-link is-selected" : "nav-link"}>
          Explore
        </a>
        <a href="/about" className={route === "/about" ? "nav-link is-selected" : "nav-link"}>
          About
        </a>
        <a href="/mydrops" className={route === "/mydrops" ? "nav-link is-selected" : "nav-link"}>
          My Drops
        </a>
      </div>
      <WalletConnect
        web3Modal={web3Modal}
        logout={logoutOfWeb3Modal}
        connect={loadWeb3Modal}
        setProvider={setProvider}
      />
      <img
        className="hamburger"
        alt=""
        onClick={() => {
          setExpanded(!expanded);
        }}
        src={hamburger}
      />
    </nav>
  );
}
