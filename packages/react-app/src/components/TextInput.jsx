import React from "react";
import "./TextInput.scss";

export default function TextInput({ onChange, name, label, placeholder, multiline = false, defaultText }) {
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
          rows="1"
          onInput={autoGrow}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          value={defaultText}
        />
      ) : (
        <input name={name} type="text" placeholder={placeholder} onChange={onChange} value={defaultText} />
      )}
    </div>
  );
}
