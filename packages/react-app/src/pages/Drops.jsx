import React, { useContext } from "react";
import { useQuery } from "react-query";

import { apiRequest } from "../util/util";
import { AuthRequired, DropPreview } from "components";
import { AuthContext } from "Contexts";
import "./Drops.scss";

export default function Drops({ provider }) {
  const [jwtAuthToken] = useContext(AuthContext);
  const query = () => apiRequest({ path: `v1/getDrops?`, method: "GET", accessToken: jwtAuthToken });
  const { isLoading, error, data, isFetching } = useQuery(`userDrops`, query, { refetchInterval: 3000 });

  return jwtAuthToken ? (
    <div className="my-drops">
      <div className="header">
        <h1>My Drops</h1>
        <button
          className="button-alt"
          onClick={() => {
            window.location.href = "/mint";
          }}
        >
          Create New
        </button>
      </div>
      {isLoading || (isFetching && !data) ? (
        <div className="loading" />
      ) : (
        data.drops?.map(drop => {
          if (drop.status !== "PROCESSING") {
            const mintable = drop.content?.some(e => e.status !== "MINTED");
            /* const listable = drop.content?.some(e => e.orders.success === true && e.orders.orders.length > 0); */
            const publishable = drop.status !== "LISTED";
            return (
              <DropPreview
                key={drop.dropId}
                dropId={drop.dropId}
                previewImg={drop.dropPreviewUrl}
                title={drop.dropTitle}
                subtitle={drop.numberOfItems + " Pieces"}
                altSubtitle={mintable ? "Mintable" : publishable ? "Minted" : "Published"}
                description={drop.dropDescription}
                prompt={mintable ? "Edit" : publishable ? "Publish" : "View"}
                action={
                  mintable
                    ? () => {
                        window.location.href = `/mint/${drop.dropId}`;
                      }
                    : publishable
                    ? () => {
                        window.location.href = `/mint/${drop.dropId}`;
                      }
                    : () => {
                        window.location.href = `/drop/${drop.dropId}`;
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
    <AuthRequired provider={provider} />
  );
}
