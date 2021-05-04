import React, { useState, useEffect } from "react";
import { ReactComponent as Timer } from "assets/timer.svg";
import { useParams } from "react-router";
import { apiRequest } from "../util/util.js";
import "./Drop.scss";

const DEFAULT_DATA = {
  dropDate: "2021-06-03T23:02:18.152Z",
  ethPrice: 2.0,
  usdPrice: 5503.22,
};

export default function Drop() {
  const { id } = useParams();
  const [dropData, setDropData] = useState();
  const timeLeft = new Date(Date.parse(DEFAULT_DATA.dropDate) - Date.now());

  const getTimeString = () => `${timeLeft.getUTCDate() > 1 ? `${timeLeft.getUTCDate() - 1}d` : ""}
            ${timeLeft.getUTCDate() > 1 || timeLeft.getUTCHours() > 0 ? `${timeLeft.getUTCHours()}h` : ""}
            ${
              timeLeft.getUTCDate() > 1 || timeLeft.getUTCHours() > 0 || timeLeft.getUTCMinutes() > 0
                ? `${timeLeft.getUTCMinutes()}m`
                : ""
            }
            ${
              timeLeft.getUTCDate() > 1 ||
              timeLeft.getUTCHours() > 0 ||
              timeLeft.getUTCMinutes() > 0 ||
              timeLeft.getUTCSeconds() > 0
                ? `${timeLeft.getUTCSeconds()}s`
                : ""
            }`;

  useEffect(() => {
    apiRequest({ path: `v1/public/getDrops?dropId=${id}`, method: "GET" }).then(data => {
      setDropData(data.drops[0]);
      console.log({ data: data.drops[0] });
    });
  }, [id]);

  return dropData ? (
    <div className="drop-container">
      <div className="gallery-container">
        <div className="image-container">
          <div className="bottom" />
          <div className="middle" />
          <img alt="" src={dropData.dropPreviewUrl} />
        </div>
        <div className="action-container">
          <button className="button is-primary">Purchase</button>
          <button disabled={true} className="button timer">
            <Timer />
            {getTimeString()}
          </button>
        </div>
      </div>
      <div className="text-container">
        <h1>{dropData.dropTitle}</h1>
        <h2>
          <span className="alt-color-large"> Collection </span>
          <span className="alt">{dropData.content.length} Pieces</span>
        </h2>
        <h2>
          Ξ {dropData.price || DEFAULT_DATA.ethPrice} <span className="alt">${DEFAULT_DATA.usdPrice} USD</span>{" "}
          <span className="alt-color">Per Piece</span>
        </h2>
        <p>{dropData.dropDescription}</p>
      </div>
    </div>
  ) : null;
}
