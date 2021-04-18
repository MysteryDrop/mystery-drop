import React from "react";
import "./StepIndicator.scss";

export default function StepIndicator({ steps, selected }) {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div className={`step ${selected === index ? "current" : selected < index ? "future" : "done"}`}>
          <p>{step}</p>
        </div>
      ))}
    </div>
  );
}
