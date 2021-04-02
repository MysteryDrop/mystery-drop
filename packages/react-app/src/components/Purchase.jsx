import React, { useState } from "react";
import { formatEther, parseEther } from "@ethersproject/units";
import smallLogo from "assets/logo-small.svg";
import "./Purchase.css";

export default function Purchase({ availTokens, yourBalance, tokenAddress, currPrice, tx, writeContracts }) {
  const purchaseToken = () => {
    const quantity = "" + 1 * 10 ** 18;
    tx(writeContracts.TokenSale.buyToken(tokenAddress, quantity, { value: currPrice }));
  };

  return (
    <div id="purchase">
      <img alt="" src={smallLogo} />
      <h1>Only {formatEther(availTokens)} Remaining</h1>
      <p>Current Price: {formatEther(currPrice)}ETH</p>
      <p>Your Balance {formatEther(yourBalance)}</p>
      {writeContracts ? (
        <button onClick={purchaseToken}>Purchase</button>
      ) : (
        <p className="no-wallet">Connect your wallet to puchase</p>
      )}
    </div>
  );
}
