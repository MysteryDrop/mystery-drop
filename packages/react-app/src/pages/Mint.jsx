import React, { useState, useEffect, useRef, useContext } from "react";
import { useQueryClient } from "react-query";
import axios, { AxiosResponse } from "axios";
import { v4 as uuid } from "uuid";
import { useParams } from "react-router";

import { AuthRequired, Modal, StepIndicator, DropInfoInput, CollectionDetails, CollectionList } from "components";
import "./Mint.scss";
import { apiRequest } from "../util/util";
import { CollectionMint } from "components";
import { AuthContext, ModalContext } from "Contexts";

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

export default function Mint({ provider, mainnetProvider }) {
  const { id } = useParams();
  const [jwtAuthToken, setJwtAuthToken] = useContext(AuthContext);
  const [step, setStep] = useState(id ? 1 : 0);
  const [artworks, setArtworks] = useState([]);
  const [bannerImg, setBannerImg] = useState();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [dropDate, setDropDate] = useState();
  const [dropId, setDropId] = useState(id);
  const [price, setPrice] = useState();
  const [modal, setModal] = useContext(ModalContext);
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
      <h1>New Drop</h1>
      <StepIndicator steps={["Info", "Mint"]} selected={step} />
      {step === 0 ? (
        <DropInfoInput
          artworks={artworks}
          setArtworks={setArtworks}
          bannerImg={bannerImg}
          setBannerImg={setBannerImg}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          dropDate={dropDate}
          setDropDate={setDropDate}
          price={price}
          setPrice={setPrice}
          onSubmit={() => {
            setModal({
              title: "Warning",
              description:
                "This step is irreversible. After this point you will not be able to come back and edit your drop.",
              actions: [
                {
                  text: "Cancel",
                  action: () => {
                    setModal(null);
                  },
                  isPrimary: false,
                },
                {
                  text: "Continue",
                  action: () => {
                    upload();
                    setModal(null);
                    setStep(step + 1);
                  },
                  isPrimary: true,
                },
              ],
            });
          }}
        />
      ) : (
        <CollectionMint provider={provider} mainnetProvider={mainnetProvider} dropId={dropId} />
      )}
    </div>
  ) : (
    <AuthRequired provider={provider} />
  );
}
