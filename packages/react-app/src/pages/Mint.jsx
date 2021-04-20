import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "react-query";
import axios, { AxiosResponse } from "axios";
import { v4 as uuid } from "uuid";

import { AuthRequired, StepIndicator, CollectionUpload, CollectionDetails } from "components";
import "./Mint.scss";
import { logout } from "util/auth";
import { apiRequest } from "../util/util";
import Drops from "components/Drops";

async function logDrops({ jwtAuthToken }) {
  const result = await apiRequest({ path: "v1/getDrops", method: "GET", accessToken: jwtAuthToken });
  console.log({ result });
}

export async function uploadDrop({ jwtAuthToken, bannerImg, title, description, dropDate, artworks, setDropId }) {
  const contentMap = {};
  const numberOfItems = artworks.length;
  const metadata = {
    contentType: bannerImg.imageData.type,
    dropTitle: title,
    dropDescription: description,
    numberOfItems: numberOfItems,
    content: artworks.map(a => {
      const contentId = uuid();
      contentMap[contentId] = a;
      return {
        contentId,
        contentType: a.image.imageData.type,
        contentTitle: a.title,
        contentDescription: a.description,
      };
    }),
  };
  console.log({ metadata });
  console.log({ jwtAuthToken });
  const initiateResult = await apiRequest({
    path: "v1/initiateUpload",
    method: "POST",
    data: metadata,
    accessToken: jwtAuthToken,
  });
  console.log(JSON.stringify(initiateResult));

  setDropId(initiateResult.result.dropId);

  // Upload preview
  await axios.put(initiateResult.result.dropPreviewUrl, bannerImg.imageData, {
    headers: {
      "Content-Type": bannerImg.imageData.type,
    },
  });

  // upload each artwork
  for (let index = 0; index < numberOfItems; index++) {
    await axios.put(
      initiateResult.result.content[index].url,
      contentMap[initiateResult.result.content[index].contentId].image.imageData,
      {
        headers: {
          "Content-Type": bannerImg.imageData.type,
        },
      },
    );
  }
}

export default function Mint({ provider, mainnetProvider, jwtAuthToken, setJwtAuthToken }) {
  const [step, setStep] = useState(0);
  const [artworks, setArtworks] = useState([]);
  const [bannerImg, setBannerImg] = useState();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [dropDate, setDropDate] = useState();
  const [dropId, setDropId] = useState();
  const [price, setPrice] = useState();
  const queryClient = useQueryClient();

  const resetInputs = () => {
    setArtworks([]);
    setBannerImg(null);
    setTitle(null);
    setDescription(null);
    setDropDate(null);
  };

  const upload = async () => {
    console.log(
      "SUBMITING",
      JSON.stringify(
        {
          bannerImg,
          title,
          description,
          dropDate,
          artworks,
        },
        null,
        2,
      ),
    );
    await uploadDrop({ jwtAuthToken, bannerImg, title, description, dropDate, artworks, setDropId });
    queryClient.invalidateQueries("userDrops");
    resetInputs();
  };

  return jwtAuthToken ? (
    <div className="create-collection">
      <h1>Create Collection</h1>
      <StepIndicator steps={["Upload", "Details", "Mint"]} selected={step} />
      {step === 0 ? (
        <CollectionUpload
          artworks={artworks}
          setArtworks={setArtworks}
          bannerImg={bannerImg}
          setBannerImg={setBannerImg}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          onSubmit={() => {
            setStep(step + 1);
          }}
        />
      ) : step === 1 ? (
        <CollectionDetails
          dropDate={dropDate}
          setDropDate={setDropDate}
          price={price}
          setPrice={setPrice}
          goBack={() => {
            setStep(step - 1);
          }}
          onSubmit={() => {
            upload();
            setStep(step + 1);
          }}
        />
      ) : (
        <>
          {/* <button onClick={() => logDrops({ jwtAuthToken })} className="button is-primary"> */}
          {/*   Log Drops */}
          {/* </button> */}
          {/* <button onClick={() => logout({ setJwtAuthToken })} className="button is-primary"> */}
          {/*   Logout */}
          {/* </button> */}
          <Drops provider={provider} mainnetProvider={mainnetProvider} jwtAuthToken={jwtAuthToken} dropId={dropId} />
        </>
      )}
      {/* <button onClick={submit} className="submit button is-primary"> */}
      {/*   Upload Collection */}
      {/* </button> */}
    </div>
  ) : (
    <AuthRequired provider={provider} jwtAuthToken={jwtAuthToken} setJwtAuthToken={setJwtAuthToken} />
  );
}
