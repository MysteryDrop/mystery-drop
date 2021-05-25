import React from "react";
import "./StepIndicator.scss";

export default function StepIndicator({ steps, selected }) {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div key={step} className={`step ${selected === index ? "current" : selected < index ? "future" : "done"}`}>
          <p>{`${index + 1}. ${step}`}</p>
        </div>
      ))}
    </div>
  );
}
