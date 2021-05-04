import React, { useEffect, useState, useContext } from "react";
import { useQuery } from "react-query";

import "./CollectionMint.scss";
import { apiRequest } from "../util/util";
import { DropPreview } from "components";
import { createLazyMintForm, signLazyMintMessage } from "util/signtypedData/lazyMint";
import { useExchangePrice } from "hooks";
import { AuthContext } from "Contexts";
import { createOrderForm, prepareOrderMessage, putOrder, signOrderMessage } from "util/signtypedData/lazyList";

async function mintItem({ provider, contentId, dropId, jwtAuthToken }) {
  const result = await apiRequest({
    path: `v1/mint?contentId=${contentId}&dropId=${dropId}`,
    method: "GET",
    accessToken: jwtAuthToken,
  });
  console.log({ result });

  const signer = provider.getSigner();
  const address = await signer.getAddress();
  console.log({ address });

  const lazyMintForm = createLazyMintForm(
    address,
    result.tokenData.tokenId,
    result.tokenData.contractAddress,
    result.tokenData.tokenUri,
  );

  const signature = await signLazyMintMessage(
    provider,
    lazyMintForm,
    address,
    result.tokenData.chainId,
    result.tokenData.contractAddress,
  );

  console.log({ signature });
  const mintResult = await apiRequest({
    path: `v1/mint?contentId=${contentId}&dropId=${dropId}`,
    method: "POST",
    data: {
      contentId,
      dropId,
      signature,
    },
    accessToken: jwtAuthToken,
  });
  console.log({ mintResult });
}

async function publishDrop({ dropId, jwtAuthToken}) {
  const result = await apiRequest({
    path: `v1/publishDrop`,
    method: "POST",
    accessToken: jwtAuthToken,
    data: {
      dropId
    }
  });
  console.log({ result });
}

async function listItem({provider, content}) {
  const signer = provider.getSigner();
  const network = await provider.getNetwork()
  const address = await signer.getAddress();
  const form = createOrderForm(address, content.token.contract, content.token.tokenId, network.chainId)
  const order = await prepareOrderMessage(form)
  const contractAddress = '0x43162023C187662684abAF0b211dCCB96fa4eD8a'
  const signature = await signOrderMessage(provider, order, address, contractAddress)
  const result = await putOrder({...order, signature})
  console.log("list");
  console.log({result});
}

export default function Drops({ provider, mainnetProvider, dropId }) {
  const [jwtAuthToken] = useContext(AuthContext);
  console.log({ jwtAuthToken });
  const query = () => apiRequest({ path: `v1/getDrops?dropId=${dropId}`, method: "GET", accessToken: jwtAuthToken });
  const { isLoading, error, data, isFetching } = useQuery(`userDrops`, query, { refetchInterval: 3000 });

  const defaultDesc = "Description of the collection Item, this is a description placeholder.";
  const defaultPrice = 1.21;
  const usdPrice = useExchangePrice(provider._network, mainnetProvider, 1000);

  if (isLoading || (isFetching && !data)) return <div className="loader"></div>;
  if (error) return <span>`An error has occurred: ${error}`</span>;
  console.log({ data });

  return (
    <div id="drops">
      {data?.drops?.map(drop => (
        <div className="collection" key={drop.dropId}>
          {drop.content?.map(content => (
            <DropPreview
              key={content.contentId}
              previewImg={content.contentUrl}
              title={content.metadata.title}
              subtitle={`Ξ ${defaultPrice}`}
              altSubtitle={`$${(usdPrice * defaultPrice).toFixed(2)}${content.orders.success && content.orders.orders.length ? 'listed': ''}`}
              description={content.metadata.description}
              // disabled={content.status === "MINTED"}
              prompt={content.status === "MINTED" ? "List" : "Mint"}
              action={() =>
                content.status === "MINTED"
                  ? listItem({provider, content})
                  : mintItem({ provider, jwtAuthToken, contentId: content.contentId, dropId: drop.dropId })
              }
            />
          ))}
          <button
            onClick={() => {
              publishDrop({dropId: drop.dropId, jwtAuthToken})
            }}
            className="button is-primary"
          >
            Publish
          </button>
          <button
            onClick={() => {
              window.location.href = "/mydrops";
            }}
            className="button is-primary"
          >
            Finish
          </button>
        </div>
      ))}
    </div>
  );
}
