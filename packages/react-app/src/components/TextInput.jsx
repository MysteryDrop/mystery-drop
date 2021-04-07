import React from "react";
import "./TextInput.scss";

export default function TextInput({ onChange, name, label, error, placeholder, multiline = false, defaultText }) {
  const autoGrow = event => {
    const element = event.nativeEvent.target;
    element.style.height = "5px";
    element.style.height = element.scrollHeight + "px";
  };

  return (
    <div className={`text-input ${multiline === true ? "multi-line" : "single-line"}`}>
      <h4>{label}</h4>
      {multiline ? (
        <textarea
          className={error ? "error" : null}
          rows="1"
          onInput={autoGrow}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          value={defaultText || ""}
        />
      ) : (
        <input
          className={error ? "error" : null}
          name={name}
          type="text"
          placeholder={placeholder}
          onChange={onChange}
          value={defaultText || ""}
        />
      )}
      <p className="error-message">{error}</p>
    </div>
  );
}
