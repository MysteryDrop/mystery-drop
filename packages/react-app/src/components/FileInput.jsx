import React from "react";
import { ReactComponent as UploadIcon } from "assets/upload-icon.svg";
import "./FileInput.scss";

export default function FileInput({ label, error, name, onChange, file }) {
  // add authenticated upload to s3 via lambda here
  const handleUpload = event => {
    try {
      const img = URL.createObjectURL(event.nativeEvent.target.files[0]);
      onChange({ imageData: event.nativeEvent.target.files[0], localUrl: img });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="file-input-container">
      <h4>{label}</h4>
      <label className={file ? "uploaded-image" : error ? "error" : null}>
        <img alt="" src={file?.localUrl} />
        <UploadIcon />
        <p>PNG, JPEG, GIF, WEBP or MP4</p>
        <input onChange={handleUpload} name={name} type="file" accept=".png,.gif,.webp,.mp4,.jpeg,.jpg" />
      </label>
      <p className="error-message">{error}</p>
    </div>
  );
}
