import React from "react";
import "./PriceInput.scss";

export default function PriceInput({ label, onChange, value = "", error }) {
  const prefix = "Ξ";

  const ensureNumber = event => {
    const input = event.nativeEvent.target.value.replace(prefix + " ", "").match(/([0-9]*\.*[0-9]*)/);
    if (input) {
      onChange(input[0]);
    } else {
      onChange("");
    }
  };

  return (
    <div className="price-input">
      <h4>{label}</h4>
      <input
        type="text"
        className={error ? "error" : null}
        value={value === "" ? "" : `${prefix} ${value}`}
        placeholder={`${prefix} 1.00`}
        onChange={ensureNumber}
      />
      <p className="error-message">{error}</p>
    </div>
  );
}
