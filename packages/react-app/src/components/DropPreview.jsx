import React, { useState } from "react";
import "./DropPreview.scss";

export default function DropPreview({
  previewImg,
  title,
  subtitle,
  altSubtitle,
  description,
  prompt,
  action,
  disabled,
}) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="drop-item">
      <img alt="" src={previewImg} />
      <div className="info-container">
        <h2>{title}</h2>
        <h4>
          {subtitle} <span className="alt">{altSubtitle}</span>
        </h4>
        <p>{description}</p>
        {loading ? (
          <div className="loader" />
        ) : (
          <button
            disabled={disabled}
            className="button-alt"
            onClick={() => {
              setLoading(true);
              action()
                .catch(err => {
                  console.error(err);
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
          >
            {prompt}
          </button>
        )}
      </div>
    </div>
  );
}
