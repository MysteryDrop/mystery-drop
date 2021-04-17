import React from "react";
import "./DateTimeInput.scss";

export default function DateTimeInput({ label, name, error, onChange, required = true, value }) {
  return (
    <div className="datetime-input-container">
      <h4>{label}</h4>
      <input
        className={error ? "error" : null}
        name={name}
        type="datetime-local"
        onChange={onChange}
        required={required}
        value={value || ""}
      />
      <p className="error-message">{error}</p>
    </div>
  );
}
