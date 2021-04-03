import React from "react";
import "./DateTimeInput.scss";

export default function DateTimeInput({ label, name, onChange, required = true }) {
  return (
    <div className="datetime-input-container">
      <h4>{label}</h4>
      <input name={name} type="datetime-local" onChange={onChange} required={required} />
    </div>
  );
}
