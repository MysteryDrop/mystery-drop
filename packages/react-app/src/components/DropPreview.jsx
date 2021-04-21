import React from "react";
import "./DropPreview.scss";

export default function Drop({ previewImg, title, subtitle, altSubtitle, description, prompt, action, disabled }) {
  return (
    <div className="drop-item">
      <img alt="" src={previewImg} />
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
