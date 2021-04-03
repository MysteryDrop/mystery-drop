import React, { useState } from "react";
import { ReactComponent as UploadIcon } from "assets/upload-icon.svg";
import "./FileInput.scss";

export default function FileInput({ label, name, onChange, defaultImg }) {
  const [file, setFile] = useState(defaultImg);

  const handleUpload = event => {
    try {
      const img = URL.createObjectURL(event.nativeEvent.target.files[0]);
      setFile(img);
      onChange(img);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="file-input-container">
      <h4>{label}</h4>
      <label className={file ? "uploaded-image" : null}>
        <div>
          <img alt="" src={file} />
        </div>
        <UploadIcon />
        <p>PNG, GIF, WEBP or MP4</p>
        <input onChange={handleUpload} name={name} type="file" accept=".png,.gif,.webp,.mp4" />
      </label>
    </div>
  );
}
