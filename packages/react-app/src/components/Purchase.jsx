import React, { useState } from "react";
import smallLogo from "../assets/logo-small.svg";
import "./Purchase.css";

export default function Purchase({ availTokens, wallet, currPrice }) {
  const purchaseToken = () => {
    // TODO: buyToken();
  };

  return (
    <div id="purchase">
      <img alt="" src={smallLogo} />
      <h1>Only {availTokens} Remaining</h1>
      <p>Current Price: {currPrice}ETH</p>
      {wallet ? (
        <button onClick={purchaseToken}>Purchase</button>
      ) : (
        <p className="no-wallet">Connect your wallet to puchase</p>
      )}
    </div>
  );
}
