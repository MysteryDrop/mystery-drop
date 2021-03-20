import React, { useState } from "react";
import "./Gallery.css";
import IPFSImage from "./IPFSImage";

const EXAMPLE_TOKENS = [
  {
    name: "Render 1",
    description: "The logo for EthGlobal NFT Hackathon",
    image: "ipfs://ipfs/QmaGLagAmRwNHdqakH2UKeDaCnNewuQmH4bTCpHCq7vzxT",
    external_url: "https://rinkeby.rarible.com/0xc06C06637B1F3bC0D66c7414e78Ba183863a7014:123913",
    attributes: [
      {
        key: "Artist",
        trait_type: "Name",
        value: "EthGlobal",
      },
    ],
  },
  {
    name: "Render 2",
    description: "The logo for EthGlobal NFT Hackathon",
    image: "ipfs://ipfs/QmaGLagAmRwNHdqakH2UKeDaCnNewuQmH4bTCpHCq7vzxT",
    external_url: "https://rinkeby.rarible.com/0xc06C06637B1F3bC0D66c7414e78Ba183863a7014:123913",
    attributes: [
      {
        key: "Artist",
        trait_type: "Name",
        value: "EthGlobal",
      },
    ],
  },
  {
    name: "Render 3",
    description: "The logo for EthGlobal NFT Hackathon",
    image: "ipfs://ipfs/QmaGLagAmRwNHdqakH2UKeDaCnNewuQmH4bTCpHCq7vzxT",
    external_url: "https://rinkeby.rarible.com/0xc06C06637B1F3bC0D66c7414e78Ba183863a7014:123913",
    attributes: [
      {
        key: "Artist",
        trait_type: "Name",
        value: "EthGlobal",
      },
    ],
  },
];

export default function Gallery({tokens}) {
  console.log({tokens})
  if (!tokens.length) return null

  return (
    <div id="gallery">
      {tokens.map(token => (
        <div key={token.id}>
          <IPFSImage uri={token.renderUri} />
          <div className="image-overlay">
            <button
              onClick={() => {
                window.open(token.external_url);
              }}
            >
              View on Rarible
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
