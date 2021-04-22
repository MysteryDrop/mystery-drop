import React from "react";
import { useQuery } from "react-query";

import { apiRequest } from "../util/util";
import { AuthRequired, DropPreview } from "components";
import "./Drops.scss";

export default function Drops({ jwtAuthToken, setJwtAuthToken, provider }) {
  const query = () => apiRequest({ path: `v1/getDrops?`, method: "GET", accessToken: jwtAuthToken });
  const { isLoading, error, data, isFetching } = useQuery(`userDrops`, query, { refetchInterval: 3000 });

  return jwtAuthToken ? (
    <div className="my-drops">
      <h1>My Drops</h1>
      {isLoading || (isFetching && !data) ? (
        <div className="loading" />
      ) : (
        data.drops?.map(drop => {
          if (drop.status !== "PROCESSING") {
            const mintable = drop.content?.some(e => e.status !== "MINTED");
            return (
              <DropPreview
                key={drop.dropId}
                previewImg={drop.dropPreviewUrl}
                title={drop.dropTitle}
                subtitle={drop.numberOfItems + " Pieces"}
                altSubtitle={mintable ? "Mintable" : "Minted"}
                description={drop.dropDescription}
                prompt={mintable ? "Edit" : "Publish"}
                action={
                  mintable
                    ? () => {
                        window.location.href = `/mint/${drop.dropId}`;
                      }
                    : () => {
                        console.log("Publish");
                      }
                }
              />
            );
          } else {
            return null;
          }
        })
      )}
    </div>
  ) : (
    <AuthRequired provider={provider} jwtAuthToken={jwtAuthToken} setJwtAuthToken={setJwtAuthToken} />
  );
}
