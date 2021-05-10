import React, { useState, useEffect } from "react";
import "./CollectionCard.scss";

const USER = {
  username: "josh_art",
  profileImg:
    "https://images.unsplash.com/photo-1529066792305-5e4efa40fde9?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2624&q=80",
};

export default function CollectionCard({ dropId, title, content, image, price, dropDate, artist }) {
  const timeLeft = new Date(Date.parse(dropDate) - Date.now());
  const [numLeft, setNumLeft] = useState();

  useEffect(() => {
    if (content) {
      setNumLeft(content.reduce((acc, item) => acc + Number(item.token.supply), 0));
    } else {
      setNumLeft(0);
    }
  }, [content]);

  return (
    <div
      className="collection-card"
      onClick={() => {
        window.location.href = `/drop/${dropId}`;
      }}
    >
      <div className="bottom card" />
      <div className="middle card" />
      <div className="top card">
        <img className="banner" alt="" src={image} />
        <div className="info-container">
          {numLeft <= 0 || timeLeft < 0 ? null : <h3 className="num-left">{numLeft} Left</h3>}
          <h2>{title}</h2>
          <div className="artist">
            <img alt="" src={USER.profileImg} />
            <p>@{USER.username}</p>
          </div>
        </div>
        <div className={`alt-info-container ${timeLeft < 0 ? "ended" : ""}`}>
          <div className="text-container">
            Price
            <br />
            <span>Ξ {price}</span>
          </div>
          {timeLeft > 0 ? (
            <div className="text-container">
              Drops in
              <br />
              <span>{`${timeLeft.getUTCDate() - 1}d ${timeLeft.getUTCHours()}h ${timeLeft.getUTCMinutes()}m`}</span>
            </div>
          ) : (
            <div className="text-container">
              <span>Ended</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
