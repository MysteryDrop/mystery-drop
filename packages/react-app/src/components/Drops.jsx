import React, { useState} from "react";
import { useQuery } from 'react-query';
import "./Drops.scss";
import { apiRequest } from "../util/util";

export default function Drops({jwtAuthToken}) {
  console.log({jwtAuthToken})
  const query = () => apiRequest({path: "v1/getDrops", method: "GET", accessToken: jwtAuthToken})
  const { isLoading, error, data, isFetching } = useQuery(
    `userDrops`,
    query,
    {refetchInterval: 3000}
  );
  if (isLoading) return <span>Loading</span>
  if (error) return <span>`An error has occurred: ${error}`</span>;
  console.log({data})

  return (
    <div id="drops">
      {data.drops.map(drop => (
        <div key={drop.dropData.dropId}>
          <span>test</span>
          <img alt="" src={drop.dropData.dropPreviewUrl}/>
          <button onClick={() => console.log({ jwtAuthToken })} className="button is-primary">
            Mint Collection
          </button>
        </div>
      ))}
    </div>
  );
}
