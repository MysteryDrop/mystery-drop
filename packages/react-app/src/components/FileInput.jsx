import React from "react";
import { ReactComponent as UploadIcon } from "assets/upload-icon.svg";
import "./FileInput.scss";

export default function fileInput({ label, name }) {
  return (
    <div className="file-input-container">
      <h4>{label}</h4>
      <label>
        <UploadIcon />
        <p>PNG, GIF, WEBP or MP4</p>
        <input name={name} type="file" accept=".png|.gif|.webp|.mp4" />
      </label>
    </div>
  );
}
