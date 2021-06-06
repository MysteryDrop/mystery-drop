import React from "react";
import "./Modal.scss";

export default function Modal({ data }) {
  return data ? (
    <div className="modal-container">
      <div className="modal">
        <h2>{data.title}</h2>
        <p>{data.description}</p>
        <div className="action-container">
          {data.actions?.map(({ text, action, isPrimary }) => (
            <button key={text} onClick={action} className={isPrimary ? "primary" : ""}>
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;
}
