import React, { useState } from "react";
import { Link } from "react-router-dom";
import WalletConnect from "./WalletConnect";
import logoDark from "../assets/mysteryDrop-logo-dark.svg";

// displays a page header

export default function Header({ loadWeb3Modal, web3Modal, logoutOfWeb3Modal, setProvider }) {
  const [route, setRoute] = useState(window.location.pathname);

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="navbar-item" href="/">
          <img src={logoDark} height="35" alt="logo" />
        </a>

        <a
          role="button"
          className="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbarBasicExample"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>

      <div id="navbarBasicExample" className="navbar-menu">
        <div className="navbar-start">
          <Link
            className={route === "/" ? "navbar-item is-selected" : "navbar-item"}
            to="/"
            onClick={() => {
              setRoute("/");
            }}
          >
            Home
          </Link>
          <Link
            className={route === "/gallery" ? "navbar-item is-selected" : "navbar-item"}
            to="/gallery"
            onClick={() => {
              setRoute("/gallery");
            }}
          >
            Gallery
          </Link>
          <Link
            className={route === "/about" ? "navbar-item is-selected" : "navbar-item"}
            to="/about"
            onClick={() => {
              setRoute("/about");
            }}
          >
            About
          </Link>

          <Link
            className={route === "/mint" ? "navbar-item is-selected" : "navbar-item"}
            to="/mint"
            onClick={() => {
              setRoute("/mint");
            }}
          >
            Mint
          </Link>
          <Link
            className={route === "/debugcontracts" ? "navbar-item is-selected" : "navbar-item"}
            to="/debugcontracts"
            onClick={() => {
              setRoute("/debugcontracts");
            }}
          >
            Debug
          </Link>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <div className="buttons">
              <WalletConnect
                web3Modal={web3Modal}
                logout={logoutOfWeb3Modal}
                connect={loadWeb3Modal}
                setProvider={setProvider}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
