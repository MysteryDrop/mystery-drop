import React from "react";
import "./DropPreview.scss";

export default function Drop({
  previewImg,
  dropId,
  title,
  subtitle,
  altSubtitle,
  description,
  prompt,
  action,
  disabled,
}) {
  const minted = altSubtitle === "Minted";
  return (
    <div className={`drop-item ${minted ? "minted" : ""}`}>
      <img
        alt=""
        src={previewImg}
        onClick={() => {
          if (minted) {
            window.location.href = `/mydrops/${dropId}`;
          }
        }}
      />
      <div className="info-container">
        <h2>{title}</h2>
        <h4>
          {subtitle} <span className="alt">{altSubtitle}</span>
        </h4>
        <p>{description}</p>
        <button disabled={disabled} className="button-alt" onClick={action}>
          {prompt}
        </button>
      </div>
    </div>
  );
}
