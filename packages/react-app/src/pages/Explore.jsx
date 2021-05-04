import React, { useState, useEffect } from "react";
import { CollectionCard, Hero } from "components";
import { apiRequest } from "../util/util";
import "./Explore.scss";

const DROP_EXAMPLE = [0, 1, 2, 3].map(() => ({
  contentType: "image/png",
  createdAt: "2021-04-20T22:26:16.515Z",
  dropDescription: "test",
  dropId: "e6754998-0ba1-4100-a15f-aa766cdfe043",
  dropPreviewUrl:
    "https://images.unsplash.com/photo-1615445167846-6e8a8f27c004?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1934&q=80",
  dropTitle: "test",
  numberOfItems: "1",
  price: 2.02,
  dropDate: "2021-05-20T22:26:16.515Z",
}));

export default function Explore() {
  const [drops, setDrops] = useState();

  useEffect(() => {
    apiRequest({ path: "v1/public/getDrops", method: "GET" }).then(data => {
      setDrops(data.drops);
    });
  }, []);

  return (
    <>
      <Hero />
      <div className="drops-container">
        <h4>Current Drops</h4>
        <div className="cards-container">
          {drops?.map(
            (
              {
                dropId,
                dropTitle,
                content,
                dropPreviewUrl,
                price = 2.02,
                dropDate = "2021-05-20T22:26:16.515Z",
                artistID,
              },
              index,
            ) => (
              <CollectionCard
                key={index}
                title={dropTitle}
                content={content}
                image={dropPreviewUrl}
                price={price}
                dropDate={dropDate}
                artist={artistID}
                dropId={dropId}
              />
            ),
          )}
        </div>
      </div>
      {/* <div className="drops-container"> */}
      {/*   <h4>Past Drops</h4> */}
      {/*   <div className="cards-container"> */}
      {/*     {DROP_EXAMPLE.map( */}
      {/*       ({ dropId, dropTitle, numberOfItems, dropPreviewUrl, price, dropDate, artistID }, index) => ( */}
      {/*         <CollectionCard */}
      {/*           key={index} */}
      {/*           title={dropTitle} */}
      {/*           numLeft={numberOfItems} */}
      {/*           image={dropPreviewUrl} */}
      {/*           price={price} */}
      {/*           dropDate="2021-04-20T22:26:16.515Z" */}
      {/*           artist={artistID} */}
      {/*           dropId={dropId} */}
      {/*         /> */}
      {/*       ), */}
      {/*     )} */}
      {/*   </div> */}
      {/* </div> */}
    </>
  );
}
