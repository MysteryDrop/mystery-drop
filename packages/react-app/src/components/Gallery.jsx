import React, { useState } from "react";
import "./Gallery.css";

const EXAMPLE_TOKENS = [
  {
    name: "Render 1",
    description: "The logo for EthGlobal NFT Hackathon",
    image: "https://cdn.discordapp.com/attachments/822136677635457024/822504222527848518/textures_lores.png",
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
    image: "https://cdn.discordapp.com/attachments/822136677635457024/822504222527848518/textures_lores.png",
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
    image: "https://cdn.discordapp.com/attachments/822136677635457024/822504222527848518/textures_lores.png",
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

export default function Gallery() {
  const [tokens, setTokens] = useState(EXAMPLE_TOKENS);

  return (
    <div id="gallery">
      {tokens.map(token => (
        <div key={token.name}>
          <img
            onClick={() => {
              window.open(token.external_url);
            }}
            alt="token"
            src={token.image}
          />
        </div>
      ))}
    </div>
  );
}
