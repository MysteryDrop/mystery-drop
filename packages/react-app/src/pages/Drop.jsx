import React, { useState, useEffect, useContext } from "react";
import { SectionSelector } from "components";
import { ReactComponent as Timer } from "assets/timer.svg";
import { ReactComponent as ShareIcon } from "assets/share.svg";
import { ReactComponent as Lock } from "assets/lock.svg";
import { AuthContext } from "../Contexts";
import { useParams } from "react-router";
import { apiRequest } from "../util/util.js";
import "./Drop.scss";

const DEFAULT_DATA = {
  dropDate: "2021-06-10T23:02:18.152Z",
  ethPrice: 2.0,
  usdPrice: 5503.22,
  owner: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
};

export default function Drop({ isOwner }) {
  const { id } = useParams();
  const [jwtAuthToken, setJwtAuthToken] = useContext(AuthContext);
  const [dropData, setDropData] = useState();
  const [section, setSection] = useState("NFTs");
  const timeLeft = new Date(Date.parse(DEFAULT_DATA.dropDate) - Date.now());

  const getTimeString = () =>
    `${timeLeft.getUTCDate() > 1 ? `${timeLeft.getUTCDate() - 1}:` : ""}${
      timeLeft.getUTCDate() > 1 || timeLeft.getUTCHours() > 0 ? `${timeLeft.getUTCHours()}:` : ""
    }${
      timeLeft.getUTCDate() > 1 || timeLeft.getUTCHours() > 0 || timeLeft.getUTCMinutes() > 0
        ? `${timeLeft.getUTCMinutes()}:`
        : ""
    }${
      timeLeft.getUTCDate() > 1 ||
      timeLeft.getUTCHours() > 0 ||
      timeLeft.getUTCMinutes() > 0 ||
      timeLeft.getUTCSeconds() > 0
        ? `${timeLeft.getUTCSeconds()}`
        : ""
    }`;

  useEffect(() => {
    if (isOwner) {
      apiRequest({ path: `v1/public/getDrops?dropId=${id}`, method: "GET", accessToken: jwtAuthToken }).then(data => {
        setDropData(data.drops[0]);
        console.log({ data });
      });
    } else {
      apiRequest({ path: `v1/public/getDrops?dropId=${id}`, method: "GET" }).then(data => {
        setDropData(data.drops[0]);
        console.log({ data: data.drops[0] });
      });
    }
  }, [id]);

  return dropData ? (
    <div className="drop-container">
      <div className="drop-preview-container">
        <div className="gallery-container">
          <div className="image-container">
            <div className="bottom" />
            <div className="middle" />
            <img alt="" src={dropData.dropPreviewUrl} />
          </div>
        </div>
        <div className="text-container">
          <h1>
            {dropData.dropTitle}
            <ShareIcon
              className="share-icon"
              onClick={() => {
                console.log("Share");
              }}
            />
          </h1>
          <h2>
            <span className="alt-color-large"> Drop </span>
            <span className="alt">{new Date(DEFAULT_DATA.dropDate).toDateString()}</span>
          </h2>
          <h2>
            Ξ {dropData.price || DEFAULT_DATA.ethPrice} <span className="alt">${DEFAULT_DATA.usdPrice} USD</span>{" "}
            <span className="alt-color">Per Piece</span>
          </h2>
          <p>{dropData.dropDescription}</p>
        </div>
      </div>
      <SectionSelector sections={["NFTs", "Details"]} setSelected={setSection} selected={section} />
      {section === "NFTs" ? (
        timeLeft <= 0 ? (
          dropData.content.map(item => <p>{JSON.stringify(item, null, 2)}</p>)
        ) : (
          <div className="countdown-container">
            <h2>Drops In</h2>
            <h1>{getTimeString()}</h1>
            <button className="button is-primary">Purchase</button>
          </div>
        )
      ) : (
        <div className="details-container">
          <h2>Creator</h2>
          <p>{DEFAULT_DATA.owner}</p>
          <h2>Drop Date</h2>
          <p>{DEFAULT_DATA.dropDate}</p>
          <h2>Piece Price</h2>
          <p>Ξ {DEFAULT_DATA.ethPrice}</p>
        </div>
      )}
    </div>
  ) : null;
}
